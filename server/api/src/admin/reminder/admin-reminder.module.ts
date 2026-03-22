import { MikroOrmModule } from '@mikro-orm/nestjs';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TodoReminderSchema, TodoSchema } from '@app/domain';
import { AdminSlackService } from '../slack.service';
import { AdminReminderController } from './admin-reminder.controller';
import { AdminReminderService } from './admin-reminder.service';

@Module({
  imports: [MikroOrmModule.forFeature([TodoReminderSchema, TodoSchema]), HttpModule],
  controllers: [AdminReminderController],
  providers: [AdminReminderService, AdminSlackService],
})
export class AdminReminderModule {}
