import { Migration } from '@mikro-orm/migrations';

export class Migration20250710112149 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "account" ("id" serial primary key, "username" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null);`);
  }

}
