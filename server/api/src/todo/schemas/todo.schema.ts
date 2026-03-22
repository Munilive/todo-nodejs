import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TodoDocument = HydratedDocument<Todo>;

export enum TodoStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
}

export enum TodoContext {
  NONE = 'none',
  WORK = 'work',
  HOME = 'home',
}

@Schema()
export class Todo {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, enum: TodoStatus, default: TodoStatus.TODO, lowercase: true })
  status!: TodoStatus;

  @Prop({ required: true, enum: TodoContext, default: TodoContext.NONE, lowercase: true })
  context!: TodoContext;

  @Prop()
  dueDate?: Date;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop()
  doneAt?: Date;
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
