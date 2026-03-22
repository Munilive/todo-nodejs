import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { TodoReminderSchema } from '@app/domain';
import { SlackModule } from '../slack/slack.module';
import { ReminderScheduler } from './reminder.scheduler';

@Module({
  imports: [MikroOrmModule.forFeature([TodoReminderSchema]), SlackModule],
  providers: [ReminderScheduler],
})
export class ReminderModule {}
