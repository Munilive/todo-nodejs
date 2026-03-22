import { Entity, Enum, Opt, PrimaryKey, Property } from '@mikro-orm/core';

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

@Entity()
export class Todo {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property()
  title!: string;

  @Enum(() => TodoStatus)
  status: TodoStatus & Opt = TodoStatus.TODO;

  @Enum(() => TodoContext)
  context: TodoContext & Opt = TodoContext.NONE;

  @Property({ nullable: true })
  dueDate?: Date;

  @Property()
  createdAt: Date & Opt = new Date();

  @Property({ nullable: true })
  doneAt?: Date;
}
