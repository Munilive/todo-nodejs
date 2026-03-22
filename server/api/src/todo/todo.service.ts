import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { CreateTodoDto } from './dto/create-todo.dto';
import { ListTodoQueryDto } from './dto/list-todo.query.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo, TodoDocument, TodoStatus } from './schemas/todo.schema';

function toStartOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function toEndOfDay(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59`);
}

@Injectable()
export class TodoService {
  constructor(@InjectModel(Todo.name) private readonly todoModel: Model<TodoDocument>) {}

  async list(query: ListTodoQueryDto) {
    const { skip = 0, limit = 10, sort = '-createdAt', ...search } = query;
    const filter = this.buildFilter(search);

    const [items, totalCount] = await Promise.all([
      this.todoModel.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
      this.todoModel.countDocuments(filter).exec(),
    ]);

    return { items, totalCount, skip, limit, sort };
  }

  async get(todoId: string): Promise<TodoDocument> {
    this.validateObjectId(todoId);
    const todo = await this.todoModel
      .findById(todoId)
      .select('title status context dueDate createdAt doneAt')
      .lean()
      .exec();

    if (!todo) {
      throw new NotFoundException('할일(`Todo`)이 존재하지 않습니다.');
    }

    return todo as unknown as TodoDocument;
  }

  async create(dto: CreateTodoDto): Promise<{ _id: Types.ObjectId }> {
    const todo = await this.todoModel.create(dto);
    return { _id: todo._id };
  }

  async update(todoId: string, dto: UpdateTodoDto): Promise<void> {
    this.validateObjectId(todoId);

    if (Object.keys(dto).length === 0) {
      throw new UnprocessableEntityException('전달된 파라메터가 없습니다.');
    }

    const exists = await this.todoModel.exists({ _id: todoId });
    if (!exists) {
      throw new NotFoundException('할일(`Todo`)이 존재하지 않습니다.');
    }

    const updateSet: Record<string, unknown> = { ...dto };
    if (dto.status === TodoStatus.DONE && !updateSet['doneAt']) {
      updateSet['doneAt'] = new Date();
    }

    await this.todoModel.findByIdAndUpdate(todoId, { $set: updateSet });
  }

  async remove(todoId: string): Promise<void> {
    this.validateObjectId(todoId);

    const exists = await this.todoModel.exists({ _id: todoId });
    if (!exists) {
      throw new NotFoundException('할일(`Todo`)이 존재하지 않습니다.');
    }

    await this.todoModel.deleteOne({ _id: todoId });
  }

  private validateObjectId(id: string): void {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new UnprocessableEntityException(
        `할일 ID(\`todoId\`)의 데이터 타입은 몽고 DB의 \`ObjectId\`입니다.`,
      );
    }
  }

  private buildFilter(
    search: Omit<ListTodoQueryDto, 'skip' | 'limit' | 'sort'>,
  ): FilterQuery<Todo> {
    const and: FilterQuery<Todo>[] = [];

    if (search.title) {
      and.push({ title: new RegExp(search.title, 'i') });
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
