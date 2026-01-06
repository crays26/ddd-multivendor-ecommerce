import { Migration } from '@mikro-orm/migrations';

export class Migration20260106141631 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "outbox" ("id" uuid not null, "name" varchar(255) not null, "payload" jsonb not null, "status" varchar(255) not null, "created_at" timestamptz not null, "processed_at" timestamptz null, constraint "outbox_pkey" primary key ("id"));`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "outbox" cascade;`);
  }

}
