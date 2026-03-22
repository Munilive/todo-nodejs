import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { TodoSchema } from '@app/domain';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';

@Module({
  imports: [MikroOrmModule.forFeature([TodoSchema])],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
