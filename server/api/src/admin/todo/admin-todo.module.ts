import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { TodoReminderSchema, TodoSchema } from '@app/domain';
import { AdminTodoController } from './admin-todo.controller';
import { AdminTodoService } from './admin-todo.service';

@Module({
  imports: [MikroOrmModule.forFeature([TodoSchema, TodoReminderSchema])],
  controllers: [AdminTodoController],
  providers: [AdminTodoService],
})
export class AdminTodoModule {}
