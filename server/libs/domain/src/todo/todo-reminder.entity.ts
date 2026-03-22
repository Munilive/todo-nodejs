import { defineEntity, p, type InferEntity } from '@mikro-orm/core';
import { TodoSchema } from './todo.entity';

export enum ReminderOffsetUnit {
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
}

export const TodoReminderSchema = defineEntity({
  name: 'TodoReminder',
  properties: {
    id: p.uuid().primary().defaultRaw('gen_random_uuid()'),
    todo: p.manyToOne(TodoSchema),
    offsetValue: p.integer(),
    offsetUnit: p.enum(() => ReminderOffsetUnit),
    remindAt: p.datetime(),
    notifiedAt: p.datetime().nullable(),
    createdAt: p.datetime().defaultRaw('now()'),
  },
});

export type TodoReminder = InferEntity<typeof TodoReminderSchema>;
