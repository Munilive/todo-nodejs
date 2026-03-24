import { config } from 'dotenv';
import { resolve } from 'path';
import { defineConfig } from '@mikro-orm/postgresql';
import { TodoReminderSchema, TodoSchema } from '@app/domain';

config({ path: resolve(process.cwd(), 'api/.env') });

export default defineConfig({
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
