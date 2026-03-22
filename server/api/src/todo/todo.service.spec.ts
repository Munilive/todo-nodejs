import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateTodoDto } from './dto/create-todo.dto';
import { ListTodoQueryDto } from './dto/list-todo.query.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo, TodoContext, TodoStatus } from './entities/todo.entity';
import { TodoService } from './todo.service';

const TODO_REPO_TOKEN = Symbol('TodoRepository');

function makeTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: 'test-uuid-1234',
    title: '테스트 할일',
    status: TodoStatus.TODO,
    context: TodoContext.NONE,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  } as Todo;
}

describe('TodoService', () => {
  let service: TodoService;

  const mockEm = {
    flush: vi.fn().mockResolvedValue(undefined),
    removeAndFlush: vi.fn().mockResolvedValue(undefined),
  };

  const mockRepo = {
    findAndCount: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    assign: vi.fn(),
    getEntityManager: vi.fn().mockReturnValue(mockEm),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [TodoService, { provide: TODO_REPO_TOKEN, useValue: mockRepo }],
    })
      .overrideProvider(TodoService)
      .useFactory({
        factory: () =>
          new (TodoService as unknown as new (repo: typeof mockRepo) => TodoService)(mockRepo),
      })
      .compile();

    service = module.get(TodoService);
  });

  describe('list()', () => {
    it('기본값으로 목록을 조회한다', async () => {
      const todo = makeTodo();
      mockRepo.findAndCount.mockResolvedValue([[todo], 1]);

      const result = await service.list(new ListTodoQueryDto());

      expect(result.items).toEqual([todo]);
      expect(result.totalCount).toBe(1);
      expect(result.skip).toBe(0);
      expect(result.limit).toBe(10);
      expect(result.sort).toBe('-createdAt');
    });

    it('skip, limit, sort 파라미터를 적용한다', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      const query = Object.assign(new ListTodoQueryDto(), { skip: 5, limit: 20, sort: 'title' });
      const result = await service.list(query);

      expect(result.skip).toBe(5);
      expect(result.limit).toBe(20);
      expect(result.sort).toBe('title');
      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        {},
        { offset: 5, limit: 20, orderBy: { title: 'ASC' } },
      );
    });

    it('오름차순 sort는 ASC, 내림차순(-) sort는 DESC로 변환한다', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.list(Object.assign(new ListTodoQueryDto(), { sort: '-createdAt' }));
      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ orderBy: { createdAt: 'DESC' } }),
      );

      await service.list(Object.assign(new ListTodoQueryDto(), { sort: 'title' }));
      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ orderBy: { title: 'ASC' } }),
      );
    });

    it('title 검색 조건을 $ilike로 변환한다', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.list(Object.assign(new ListTodoQueryDto(), { title: '청소' }));

      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        { $and: [{ title: { $ilike: '%청소%' } }] },
        expect.anything(),
      );
    });

    it('status, context 필터를 적용한다', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.list(
        Object.assign(new ListTodoQueryDto(), {
          status: TodoStatus.DONE,
          context: TodoContext.WORK,
        }),
      );

      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        { $and: [{ status: TodoStatus.DONE }, { context: TodoContext.WORK }] },
        expect.anything(),
      );
    });

    it('날짜 범위 필터를 적용한다', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.list(
        Object.assign(new ListTodoQueryDto(), {
          startCreatedAt: '2024-01-01',
          endCreatedAt: '2024-01-31',
        }),
      );

      const [where] = mockRepo.findAndCount.mock.calls[0] as [{ $and: unknown[] }, unknown];
      expect(where.$and).toHaveLength(1);
    });
  });

  describe('get()', () => {
    it('할일을 반환한다', async () => {
      const todo = makeTodo();
      mockRepo.findOne.mockResolvedValue(todo);

      const result = await service.get('test-uuid-1234');

      expect(result).toEqual(todo);
      expect(mockRepo.findOne).toHaveBeenCalledWith({ id: 'test-uuid-1234' });
    });

    it('할일이 없으면 NotFoundException을 던진다', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.get('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create()', () => {
    it('할일을 생성하고 id를 반환한다', async () => {
      const dto: CreateTodoDto = { title: '새 할일' };
      const createdTodo = makeTodo({ id: 'new-uuid', title: '새 할일' });
      mockRepo.create.mockReturnValue(createdTodo);

      const result = await service.create(dto);

      expect(result).toEqual({ id: 'new-uuid' });
      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockEm.flush).toHaveBeenCalled();
    });
  });

  describe('update()', () => {
    it('할일을 수정한다', async () => {
      const todo = makeTodo();
      mockRepo.findOne.mockResolvedValue(todo);

      const dto: UpdateTodoDto = { title: '수정된 제목' };
      await service.update('test-uuid-1234', dto);

      expect(mockRepo.assign).toHaveBeenCalledWith(todo, dto);
      expect(mockEm.flush).toHaveBeenCalled();
    });

    it('status가 done이면 doneAt을 자동 설정한다', async () => {
      const todo = makeTodo({ doneAt: undefined });
      mockRepo.findOne.mockResolvedValue(todo);

      const dto: UpdateTodoDto = { status: TodoStatus.DONE };
      await service.update('test-uuid-1234', dto);

      expect(todo.doneAt).toBeInstanceOf(Date);
    });

    it('이미 doneAt이 있으면 덮어쓰지 않는다', async () => {
      const existingDoneAt = new Date('2024-01-01');
      const todo = makeTodo({ doneAt: existingDoneAt });
      mockRepo.findOne.mockResolvedValue(todo);

      const dto: UpdateTodoDto = { status: TodoStatus.DONE };
      await service.update('test-uuid-1234', dto);

      expect(todo.doneAt).toBe(existingDoneAt);
    });

    it('빈 body면 UnprocessableEntityException을 던진다', async () => {
      await expect(service.update('test-uuid-1234', {})).rejects.toThrow(
        UnprocessableEntityException,
      );
    });

    it('할일이 없으면 NotFoundException을 던진다', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', { title: '수정' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove()', () => {
    it('할일을 삭제한다', async () => {
      const todo = makeTodo();
      mockRepo.findOne.mockResolvedValue(todo);

      await service.remove('test-uuid-1234');

      expect(mockEm.removeAndFlush).toHaveBeenCalledWith(todo);
    });

    it('할일이 없으면 NotFoundException을 던진다', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
