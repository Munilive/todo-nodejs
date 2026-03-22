import { Migration } from '@mikro-orm/migrations';

export class Migration20260322091653 extends Migration {
  override up(): void | Promise<void> {
    this.addSql(
      `create table "todo_reminder" ("id" uuid not null default gen_random_uuid(), "todo_id" uuid not null, "offset_value" int not null, "offset_unit" text not null, "remind_at" timestamptz not null, "notified_at" timestamptz null, "created_at" timestamptz not null default now(), primary key ("id"));`,
    );

    this.addSql(
      `alter table "todo_reminder" add constraint "todo_reminder_todo_id_foreign" foreign key ("todo_id") references "todo" ("id");`,
    );
    this.addSql(
      `alter table "todo_reminder" add constraint "todo_reminder_offset_unit_check" check ("offset_unit" in ('minute', 'hour', 'day'));`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "todo_reminder" cascade;`);
  }
}
