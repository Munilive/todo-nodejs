import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Todo } from '@todo-nodejs/domain';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';

@Module({
  imports: [MikroOrmModule.forFeature([Todo])],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
