import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { ListTodoQueryDto } from './dto/list-todo.query.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo, TodoStatus } from '@todo-nodejs/domain';

function toStartOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function toEndOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59`);
}

function parseSort(sort: string): Record<string, 'ASC' | 'DESC'> {
  if (sort.startsWith('-')) {
    return { [sort.slice(1)]: 'DESC' };
  }
  return { [sort]: 'ASC' };
}

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepo: EntityRepository<Todo>,
  ) {}

  async list(query: ListTodoQueryDto) {
    const { skip = 0, limit = 10, sort = '-createdAt', ...search } = query;
    const where = this.buildWhere(search);

    const [items, totalCount] = await this.todoRepo.findAndCount(where, {
      offset: skip,
      limit,
      orderBy: parseSort(sort),
    });

    return { items, totalCount, skip, limit, sort };
  }

  async get(todoId: string): Promise<Todo> {
    const todo = await this.todoRepo.findOne({ id: todoId });

    if (!todo) {
      throw new NotFoundException('할일(`Todo`)이 존재하지 않습니다.');
    }

    return todo;
  }

  async create(dto: CreateTodoDto): Promise<{ id: string }> {
    const todo = this.todoRepo.create(dto);
    await this.todoRepo.getEntityManager().flush();
    return { id: todo.id };
  }

  async update(todoId: string, dto: UpdateTodoDto): Promise<void> {
    if (Object.keys(dto).length === 0) {
      throw new UnprocessableEntityException('전달된 파라메터가 없습니다.');
    }

    const todo = await this.todoRepo.findOne({ id: todoId });
    if (!todo) {
      throw new NotFoundException('할일(`Todo`)이 존재하지 않습니다.');
    }

    this.todoRepo.assign(todo, dto);

    if (dto.status === TodoStatus.DONE && !todo.doneAt) {
      todo.doneAt = new Date();
    }

    await this.todoRepo.getEntityManager().flush();
  }

  async remove(todoId: string): Promise<void> {
    const todo = await this.todoRepo.findOne({ id: todoId });
    if (!todo) {
      throw new NotFoundException('할일(`Todo`)이 존재하지 않습니다.');
    }

    await this.todoRepo.getEntityManager().removeAndFlush(todo);
  }

  private buildWhere(search: Omit<ListTodoQueryDto, 'skip' | 'limit' | 'sort'>): FilterQuery<Todo> {
    const and: FilterQuery<Todo>[] = [];

    if (search.title) {
      and.push({ title: { $ilike: `%${search.title}%` } });
    }
    if (search.status) {
      and.push({ status: search.status });
    }
    if (search.context) {
      and.push({ context: search.context });
    }
    if (search.startDueDate && search.endDueDate) {
      and.push({
        dueDate: { $gte: toStartOfDay(search.startDueDate), $lte: toEndOfDay(search.endDueDate) },
      });
    }
    if (search.startDoneAt && search.endDoneAt) {
      and.push({
        doneAt: { $gte: toStartOfDay(search.startDoneAt), $lte: toEndOfDay(search.endDoneAt) },
      });
    }
    if (search.startCreatedAt && search.endCreatedAt) {
      and.push({
        createdAt: {
          $gte: toStartOfDay(search.startCreatedAt),
          $lte: toEndOfDay(search.endCreatedAt),
        },
      });
    }

    return and.length > 0 ? { $and: and } : {};
  }
}
