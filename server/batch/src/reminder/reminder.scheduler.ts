import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TodoReminderSchema, type TodoReminder } from '@app/domain';
import { SlackService } from '../slack/slack.service';

@Injectable()
export class ReminderScheduler {
  private readonly logger = new Logger(ReminderScheduler.name);

  constructor(
    @InjectRepository(TodoReminderSchema)
    private readonly reminderRepo: EntityRepository<TodoReminder>,
    private readonly slackService: SlackService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sendPendingReminders(): Promise<void> {
    const now = new Date();

    const reminders = await this.reminderRepo.find(
      { remindAt: { $lte: now }, notifiedAt: null },
      { populate: ['todo'] },
    );

    if (reminders.length === 0) return;

    this.logger.log(`미발송 알림 ${reminders.length}건 처리 시작`);

    for (const reminder of reminders) {
      try {
        const todo = reminder.todo;
        const dueDateStr = todo.dueDate
          ? `마감일: ${todo.dueDate.toLocaleDateString('ko-KR')}`
          : '';
        const text = `[할일 알림] *${todo.title}* ${dueDateStr}`.trim();

        await this.slackService.sendMessage(text);

        reminder.notifiedAt = new Date();
        await this.reminderRepo.getEntityManager().flush();

        this.logger.log({ reminderId: reminder.id }, '알림 발송 완료');
      } catch (error) {
        this.logger.error({ reminderId: reminder.id, error }, '알림 발송 중 오류 발생');
      }
    }
  }
}
