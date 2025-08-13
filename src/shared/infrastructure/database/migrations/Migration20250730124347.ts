import { Migration } from '@mikro-orm/migrations';

export class Migration20250730124347 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "account" ("id" varchar(255) not null, "username" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, constraint "account_pkey" primary key ("id"));`);

    this.addSql(`create table "product_entity" ("id" serial primary key, "name" varchar(255) not null, "slug" varchar(255) not null, "password" varchar(255) not null);`);

    this.addSql(`create table "role" ("id" varchar(255) not null, "name" varchar(255) not null, constraint "role_pkey" primary key ("id"));`);

    this.addSql(`create table "account_roles" ("account_id" varchar(255) not null, "role_id" varchar(255) not null, constraint "account_roles_pkey" primary key ("account_id", "role_id"));`);

    this.addSql(`alter table "account_roles" add constraint "account_roles_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "account_roles" add constraint "account_roles_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade on delete cascade;`);

    this.addSql(`drop table if exists "book" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "account_roles" drop constraint "account_roles_account_id_foreign";`);

    this.addSql(`alter table "account_roles" drop constraint "account_roles_role_id_foreign";`);

    this.addSql(`create table "book" ("id" serial primary key, "name" varchar(255) not null, "account_id" int4 not null);`);

    this.addSql(`drop table if exists "account" cascade;`);

    this.addSql(`drop table if exists "product_entity" cascade;`);

    this.addSql(`drop table if exists "role" cascade;`);

    this.addSql(`drop table if exists "account_roles" cascade;`);
  }

}
