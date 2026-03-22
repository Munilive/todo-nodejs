import { Module } from '@nestjs/common';
import { AdminTodoModule } from './todo/admin-todo.module';
import { AdminReminderModule } from './reminder/admin-reminder.module';
import { AdminStatsModule } from './stats/admin-stats.module';

@Module({
  imports: [AdminTodoModule, AdminReminderModule, AdminStatsModule],
})
export class AdminModule {}
