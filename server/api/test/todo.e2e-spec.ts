import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { TodoController } from '../src/todo/todo.controller';
import { TodoService } from '../src/todo/todo.service';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { TodoStatus, TodoContext } from '../src/todo/entities/todo.entity';

describe('Todo E2E', () => {
  let app: INestApplication;

  const mockService = {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [{ provide: TodoService, useValue: mockService }],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/todo', () => {
    it('200 — 할일 목록을 반환한다', async () => {
      const payload = {
        items: [{ id: 'uuid-1', title: '할일 1', status: TodoStatus.TODO }],
        totalCount: 1,
        skip: 0,
        limit: 10,
        sort: '-createdAt',
      };
      mockService.list.mockResolvedValue(payload);

      const res = await request(app.getHttpServer()).get('/api/todo').expect(200);

      expect(res.body).toEqual(payload);
    });

    it('400 — 유효하지 않은 skip 값이면 에러를 반환한다', async () => {
      const res = await request(app.getHttpServer()).get('/api/todo?skip=abc').expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/todo/:todoId', () => {
    it('200 — 단일 할일을 반환한다', async () => {
      const todo = {
        id: '00000000-0000-0000-0000-000000000001',
        title: '할일 1',
        status: TodoStatus.TODO,
        context: TodoContext.NONE,
        createdAt: new Date().toISOString(),
      };
      mockService.get.mockResolvedValue(todo);

      const res = await request(app.getHttpServer())
        .get('/api/todo/00000000-0000-0000-0000-000000000001')
        .expect(200);

      expect(res.body.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('400 — 유효하지 않은 UUID면 에러를 반환한다', async () => {
      await request(app.getHttpServer()).get('/api/todo/not-a-uuid').expect(400);
    });
  });

  describe('POST /api/todo', () => {
    it('201 — 할일을 생성하고 id를 반환한다', async () => {
      mockService.create.mockResolvedValue({ id: 'new-uuid' });

      const res = await request(app.getHttpServer())
        .post('/api/todo')
        .send({ title: '새 할일' })
        .expect(201);

      expect(res.body).toEqual({ id: 'new-uuid' });
    });

    it('400 — title이 없으면 에러를 반환한다', async () => {
      const res = await request(app.getHttpServer()).post('/api/todo').send({}).expect(400);

      expect(res.body.error).toBeDefined();
    });

    it('400 — 유효하지 않은 status면 에러를 반환한다', async () => {
      await request(app.getHttpServer())
        .post('/api/todo')
        .send({ title: '할일', status: 'invalid' })
        .expect(400);
    });
  });

  describe('PUT /api/todo/:todoId', () => {
    it('204 — 할일을 수정한다', async () => {
      mockService.update.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .put('/api/todo/00000000-0000-0000-0000-000000000001')
        .send({ title: '수정된 제목' })
        .expect(204);

      expect(mockService.update).toHaveBeenCalledWith(
        '00000000-0000-0000-0000-000000000001',
        expect.objectContaining({ title: '수정된 제목' }),
      );
    });

    it('400 — 유효하지 않은 UUID면 에러를 반환한다', async () => {
      await request(app.getHttpServer())
        .put('/api/todo/not-a-uuid')
        .send({ title: '수정' })
        .expect(400);
    });
  });

  describe('DELETE /api/todo/:todoId', () => {
    it('204 — 할일을 삭제한다', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/todo/00000000-0000-0000-0000-000000000001')
        .expect(204);

      expect(mockService.remove).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000001');
    });

    it('400 — 유효하지 않은 UUID면 에러를 반환한다', async () => {
      await request(app.getHttpServer()).delete('/api/todo/not-a-uuid').expect(400);
    });
  });
});
