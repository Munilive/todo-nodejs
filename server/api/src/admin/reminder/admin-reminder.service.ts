import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { TodoReminderSchema, TodoSchema, type Todo, type TodoReminder } from '@app/domain';
import { AdminSlackService } from '../slack.service';
import { AdminReminderListQueryDto } from './dto/admin-reminder-list-query.dto';

@Injectable()
export class AdminReminderService {
  constructor(
    @InjectRepository(TodoReminderSchema)
    private readonly reminderRepo: EntityRepository<TodoReminder>,
    @InjectRepository(TodoSchema)
    private readonly todoRepo: EntityRepository<Todo>,
    private readonly slackService: AdminSlackService,
  ) {}

  async listByTodo(todoId: string) {
    const todo = await this.todoRepo.findOne({ id: todoId });
    if (!todo) {
      throw new NotFoundException('할일(`Todo`)이 존재하지 않습니다.');
    }

    return this.reminderRepo.find({ todo: { id: todoId } }, { orderBy: { remindAt: 'ASC' } });
  }

  async list(query: AdminReminderListQueryDto) {
    const { skip = 0, limit = 20, todoId, status, startRemindAt, endRemindAt } = query;
    const and: FilterQuery<TodoReminder>[] = [];

    if (todoId) {
      and.push({ todo: { id: todoId } });
    }
    if (status === 'pending') {
      and.push({ notifiedAt: null });
    } else if (status === 'sent') {
      and.push({ notifiedAt: { $ne: null } });
    }
    if (startRemindAt && endRemindAt) {
      and.push({
        remindAt: {
          $gte: new Date(`${startRemindAt}T00:00:00`),
          $lte: new Date(`${endRemindAt}T23:59:59`),
        },
      });
    }

    const [reminders, totalCount] = await this.reminderRepo.findAndCount(
      and.length > 0 ? { $and: and } : {},
      { offset: skip, limit, orderBy: { remindAt: 'ASC' }, populate: ['todo'] },
    );

    const items = reminders.map((r) => ({
      id: r.id,
      todoId: r.todo.id,
      todoTitle: r.todo.title,
      offsetValue: r.offsetValue,
      offsetUnit: r.offsetUnit,
      remindAt: r.remindAt,
      notifiedAt: r.notifiedAt,
      createdAt: r.createdAt,
    }));

    return { items, totalCount, skip, limit };
  }

  async remove(todoId: string, reminderId: string): Promise<void> {
    const reminder = await this.reminderRepo.findOne({
      id: reminderId,
      todo: { id: todoId },
    });
    if (!reminder) {
      throw new NotFoundException('미리 알림이 존재하지 않습니다.');
    }

    const em = this.reminderRepo.getEntityManager();
    em.remove(reminder);
    await em.flush();
  }

  async notify(todoId: string, reminderId: string): Promise<void> {
    const reminder = await this.reminderRepo.findOne(
      { id: reminderId, todo: { id: todoId } },
      { populate: ['todo'] },
    );
    if (!reminder) {
      throw new NotFoundException('미리 알림이 존재하지 않습니다.');
    }

    if (reminder.notifiedAt) {
      throw new BadRequestException('이미 발송된 알림입니다.');
    }

    const todo = reminder.todo;
    const dueDateStr = todo.dueDate ? `마감일: ${todo.dueDate.toLocaleDateString('ko-KR')}` : '';
    const text = `[할일 알림 - 강제 발송] *${todo.title}* ${dueDateStr}`.trim();

    try {
      await this.slackService.sendMessage(text);
    } catch {
      throw new ServiceUnavailableException('Slack 알림 전송에 실패했습니다.');
    }

    reminder.notifiedAt = new Date();
    await this.reminderRepo.getEntityManager().flush();
  }
}
