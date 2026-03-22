import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateTodoDto } from '../../todo/dto/create-todo.dto';
import { ListTodoQueryDto } from '../../todo/dto/list-todo.query.dto';
import { UpdateTodoDto } from '../../todo/dto/update-todo.dto';
import {
  ReminderOffsetUnit,
  TodoReminderSchema,
  TodoSchema,
  TodoStatus,
  type Todo,
  type TodoReminder,
} from '@app/domain';

const OFFSET_MS: Record<ReminderOffsetUnit, number> = {
  [ReminderOffsetUnit.MINUTE]: 60 * 1000,
  [ReminderOffsetUnit.HOUR]: 60 * 60 * 1000,
  [ReminderOffsetUnit.DAY]: 24 * 60 * 60 * 1000,
};

function calcRemindAt(dueDate: Date, offsetValue: number, offsetUnit: ReminderOffsetUnit): Date {
  return new Date(dueDate.getTime() - offsetValue * OFFSET_MS[offsetUnit]);
}

function parseSort(sort: string): Record<string, 'ASC' | 'DESC'> {
  if (sort.startsWith('-')) {
    return { [sort.slice(1)]: 'DESC' };
  }
  return { [sort]: 'ASC' };
}

function toStartOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function toEndOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59`);
}

@Injectable()
export class AdminTodoService {
  constructor(
    @InjectRepository(TodoSchema)
    private readonly todoRepo: EntityRepository<Todo>,
    @InjectRepository(TodoReminderSchema)
    private readonly reminderRepo: EntityRepository<TodoReminder>,
  ) {}

  async list(query: ListTodoQueryDto) {
    const { skip = 0, limit = 10, sort = '-createdAt', ...search } = query;
    const where = this.buildWhere(search);

    const [todos, totalCount] = await this.todoRepo.findAndCount(where, {
      offset: skip,
      limit,
      orderBy: parseSort(sort),
    });

    if (todos.length === 0) {
      return { items: [], totalCount, skip, limit, sort };
    }

    const todoIds = todos.map((t) => t.id);
    const reminders = await this.reminderRepo.find({ todo: { id: { $in: todoIds } } });

    const countMap = new Map<string, { total: number; pending: number }>();
    for (const r of reminders) {
      const todoId = (r.todo as unknown as { id: string }).id;
      const entry = countMap.get(todoId) ?? { total: 0, pending: 0 };
      entry.total += 1;
      if (r.notifiedAt === null) entry.pending += 1;
      countMap.set(todoId, entry);
    }

    const items = todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      status: todo.status,
      context: todo.context,
      dueDate: todo.dueDate,
      createdAt: todo.createdAt,
      doneAt: todo.doneAt,
      reminderCount: countMap.get(todo.id)?.total ?? 0,
      pendingReminderCount: countMap.get(todo.id)?.pending ?? 0,
    }));

    return { items, totalCount, skip, limit, sort };
  }

  async get(todoId: string) {
    const todo = await this.todoRepo.findOne({ id: todoId });
    if (!todo) {
      throw new NotFoundException('할일(`Todo`)이 존재하지 않습니다.');
    }

    const reminders = await this.reminderRepo.find(
      { todo: { id: todoId } },
      { orderBy: { remindAt: 'ASC' } },
    );

    return {
      id: todo.id,
      title: todo.title,
      status: todo.status,
      context: todo.context,
      dueDate: todo.dueDate,
      createdAt: todo.createdAt,
      doneAt: todo.doneAt,
      reminders,
    };
  }

  async create(dto: CreateTodoDto): Promise<{ id: string }> {
    const { reminders, ...todoData } = dto;

    if (reminders?.length && !todoData.dueDate) {
      throw new BadRequestException('미리 알림을 설정하려면 마감일(`dueDate`)이 필요합니다.');
    }

    const em = this.todoRepo.getEntityManager();
    const todo = this.todoRepo.create(todoData);

    if (reminders?.length && todoData.dueDate) {
      const dueDate = new Date(todoData.dueDate);
      for (const r of reminders) {
        this.reminderRepo.create({
          todo,
          offsetValue: r.offsetValue,
          offsetUnit: r.offsetUnit,
          remindAt: calcRemindAt(dueDate, r.offsetValue, r.offsetUnit),
        });
      }
    }

    await em.flush();
    return { id: todo.id };
  }

  async update(todoId: string, dto: UpdateTodoDto): Promise<void> {
    const { reminders, ...todoData } = dto;

    if (Object.keys(dto).length === 0) {
      throw new UnprocessableEntityException('전달된 파라메터가 없습니다.');
    }

    const todo = await this.todoRepo.findOne({ id: todoId });
    if (!todo) {
      throw new NotFoundException('할일(`Todo`)이 존재하지 않습니다.');
    }

    this.todoRepo.assign(todo, todoData);

    if (dto.status === TodoStatus.DONE && !todo.doneAt) {
      todo.doneAt = new Date();
    }

    const em = this.todoRepo.getEntityManager();

    if (reminders !== undefined) {
      const dueDate = todoData.dueDate ? new Date(todoData.dueDate) : todo.dueDate;

      if (reminders.length > 0 && !dueDate) {
        throw new BadRequestException('미리 알림을 설정하려면 마감일(`dueDate`)이 필요합니다.');
      }

      const unnotified = await this.reminderRepo.find({ todo: { id: todoId }, notifiedAt: null });
      for (const r of unnotified) {
        em.remove(r);
      }

      if (reminders.length > 0 && dueDate) {
        for (const r of reminders) {
          this.reminderRepo.create({
            todo,
            offsetValue: r.offsetValue,
            offsetUnit: r.offsetUnit,
            remindAt: calcRemindAt(dueDate, r.offsetValue, r.offsetUnit),
          });
        }
      }
    }

    await em.flush();
  }

  async remove(todoId: string): Promise<void> {
    const todo = await this.todoRepo.findOne({ id: todoId });
    if (!todo) {
      throw new NotFoundException('할일(`Todo`)이 존재하지 않습니다.');
    }

    const em = this.todoRepo.getEntityManager();
    const reminders = await this.reminderRepo.find({ todo: { id: todoId } });
    for (const r of reminders) {
      em.remove(r);
    }
    em.remove(todo);
    await em.flush();
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
        dueDate: {
          $gte: toStartOfDay(search.startDueDate),
          $lte: toEndOfDay(search.endDueDate),
        },
      });
    }
    if (search.startDoneAt && search.endDoneAt) {
      and.push({
        doneAt: {
          $gte: toStartOfDay(search.startDoneAt),
          $lte: toEndOfDay(search.endDoneAt),
        },
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
