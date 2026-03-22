import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateTodoDto } from './dto/create-todo.dto';
import { ListTodoQueryDto } from './dto/list-todo.query.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo, TodoContext, TodoStatus } from '@app/domain';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';

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

describe('TodoController', () => {
  let controller: TodoController;

  const mockService = {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [{ provide: TodoService, useValue: mockService }],
    }).compile();

    controller = module.get(TodoController);
  });

  describe('list()', () => {
    it('TodoService.list()에 query를 전달하고 결과를 반환한다', async () => {
      const expected = {
        items: [makeTodo()],
        totalCount: 1,
        skip: 0,
        limit: 10,
        sort: '-createdAt',
      };
      mockService.list.mockResolvedValue(expected);

      const query = new ListTodoQueryDto();
      const result = await controller.list(query);

      expect(mockService.list).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('get()', () => {
    it('TodoService.get()에 todoId를 전달하고 결과를 반환한다', async () => {
      const todo = makeTodo();
      mockService.get.mockResolvedValue(todo);

      const result = await controller.get('test-uuid-1234');

      expect(mockService.get).toHaveBeenCalledWith('test-uuid-1234');
      expect(result).toEqual(todo);
    });
  });

  describe('create()', () => {
    it('TodoService.create()에 dto를 전달하고 id를 반환한다', async () => {
      const dto: CreateTodoDto = { title: '새 할일' };
      mockService.create.mockResolvedValue({ id: 'new-uuid' });

      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'new-uuid' });
    });
  });

  describe('update()', () => {
    it('TodoService.update()에 todoId와 dto를 전달한다', async () => {
      mockService.update.mockResolvedValue(undefined);

      const dto: UpdateTodoDto = { title: '수정된 제목' };
      await controller.update('test-uuid-1234', dto);

      expect(mockService.update).toHaveBeenCalledWith('test-uuid-1234', dto);
    });
  });

  describe('remove()', () => {
    it('TodoService.remove()에 todoId를 전달한다', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('test-uuid-1234');

      expect(mockService.remove).toHaveBeenCalledWith('test-uuid-1234');
    });
  });
});
