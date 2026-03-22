import { Migration } from '@mikro-orm/migrations';

export class Migration20260322074826 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `create table "todo" ("id" uuid not null default gen_random_uuid(), "title" varchar(255) not null, "status" text not null default 'todo', "context" text not null default 'none', "due_date" timestamptz null, "created_at" timestamptz not null default now(), "done_at" timestamptz null, primary key ("id"));`,
    );

    this.addSql(
      `alter table "todo" add constraint "todo_status_check" check ("status" in ('todo', 'in_progress', 'done'));`,
    );
    this.addSql(
      `alter table "todo" add constraint "todo_context_check" check ("context" in ('none', 'work', 'home'));`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "todo" cascade;`);
  }
}
