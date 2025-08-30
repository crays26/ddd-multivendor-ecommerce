import { Migration } from '@mikro-orm/migrations';

export class Migration20250816055652 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "account" ("id" varchar(255) not null, "email" varchar(255) not null, "username" varchar(255) not null, "password" varchar(255) not null, constraint "account_pkey" primary key ("id"));`);

    this.addSql(`create table "product_entity" ("id" varchar(255) not null, "name" varchar(255) not null, "slug" varchar(255) not null, constraint "product_entity_pkey" primary key ("id"));`);

    this.addSql(`create table "product_attribute_entity" ("id" varchar(255) not null, "key" varchar(255) not null, "values" jsonb not null, "product_id" varchar(255) not null, constraint "product_attribute_entity_pkey" primary key ("id"));`);

    this.addSql(`create table "product_variant_entity" ("id" varchar(255) not null, "name" varchar(255) not null, "sku_code" varchar(255) not null, "price" int not null, "stock" int not null, "associated_attributes" jsonb not null, "product_id" varchar(255) not null, constraint "product_variant_entity_pkey" primary key ("id"));`);

    this.addSql(`create table "role" ("id" varchar(255) not null, "name" varchar(255) not null, constraint "role_pkey" primary key ("id"));`);

    this.addSql(`create table "account_roles" ("account_id" varchar(255) not null, "role_id" varchar(255) not null, constraint "account_roles_pkey" primary key ("account_id", "role_id"));`);

    this.addSql(`alter table "product_attribute_entity" add constraint "product_attribute_entity_product_id_foreign" foreign key ("product_id") references "product_entity" ("id") on update cascade;`);

    this.addSql(`alter table "product_variant_entity" add constraint "product_variant_entity_product_id_foreign" foreign key ("product_id") references "product_entity" ("id") on update cascade;`);

    this.addSql(`alter table "account_roles" add constraint "account_roles_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "account_roles" add constraint "account_roles_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "account_roles" drop constraint "account_roles_account_id_foreign";`);

    this.addSql(`alter table "product_attribute_entity" drop constraint "product_attribute_entity_product_id_foreign";`);

    this.addSql(`alter table "product_variant_entity" drop constraint "product_variant_entity_product_id_foreign";`);

    this.addSql(`alter table "account_roles" drop constraint "account_roles_role_id_foreign";`);

    this.addSql(`drop table if exists "account" cascade;`);

    this.addSql(`drop table if exists "product_entity" cascade;`);

    this.addSql(`drop table if exists "product_attribute_entity" cascade;`);

    this.addSql(`drop table if exists "product_variant_entity" cascade;`);

    this.addSql(`drop table if exists "role" cascade;`);

    this.addSql(`drop table if exists "account_roles" cascade;`);
  }

}
