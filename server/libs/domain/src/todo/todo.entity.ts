import { defineEntity, p, type InferEntity } from '@mikro-orm/core';

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

export const TodoSchema = defineEntity({
  name: 'Todo',
  properties: {
    id: p.uuid().primary().defaultRaw('gen_random_uuid()'),
    title: p.string(),
    status: p.enum(() => TodoStatus).default(TodoStatus.TODO),
    context: p.enum(() => TodoContext).default(TodoContext.NONE),
    dueDate: p.datetime().nullable(),
    createdAt: p.datetime().defaultRaw('now()'),
    doneAt: p.datetime().nullable(),
  },
});

export type Todo = InferEntity<typeof TodoSchema>;
