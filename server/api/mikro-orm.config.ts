import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { defineConfig } from '@mikro-orm/core';
import { Todo } from '../libs/domain/src/todo/todo.entity';

export default defineConfig({
  driver: PostgreSqlDriver,
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  dbName: process.env['DB_NAME'] ?? 'todo',
  user: process.env['DB_USER'] ?? 'postgres',
  password: process.env['DB_PASSWORD'] ?? '',
  entities: [Todo],
  migrations: {
    path: './migrations',
    pathTs: './migrations',
  },
});
