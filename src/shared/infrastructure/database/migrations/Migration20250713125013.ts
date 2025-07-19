import { Migration } from '@mikro-orm/migrations';

export class Migration20250713125013 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "book" ("id" serial primary key, "name" varchar(255) not null, "account_id" int not null);`);

    this.addSql(`alter table "book" add constraint "book_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "book" cascade;`);
  }

}
