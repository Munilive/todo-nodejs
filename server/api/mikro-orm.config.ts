import { config } from 'dotenv';
import { resolve } from 'path';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { defineConfig } from '@mikro-orm/core';
import { TodoReminderSchema, TodoSchema } from '@app/domain';

config({ path: resolve(process.cwd(), 'api/.env') });

export default defineConfig({
  driver: PostgreSqlDriver,
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  dbName: process.env['DB_NAME'] ?? 'todo',
  user: process.env['DB_USER'] ?? 'postgres',
  password: process.env['DB_PASSWORD'] ?? '',
  entities: [TodoSchema, TodoReminderSchema],
  migrations: {
    path: resolve(process.cwd(), 'api/migrations'),
  },
});
