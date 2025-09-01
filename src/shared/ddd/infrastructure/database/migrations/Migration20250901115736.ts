import { Migration } from '@mikro-orm/migrations';

export class Migration20250901115736 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "product_attribute_entity" drop constraint "product_attribute_entity_product_id_foreign";`);

    this.addSql(`alter table "product_variant_entity" drop constraint "product_variant_entity_product_id_foreign";`);

    this.addSql(`create table "product" ("id" varchar(255) not null, "name" varchar(255) not null, "slug" varchar(255) not null, constraint "product_pkey" primary key ("id"));`);

    this.addSql(`create table "product_attribute" ("id" varchar(255) not null, "key" varchar(255) not null, "values" jsonb not null, "is_soft_deleted" boolean not null, "product_id" varchar(255) not null, constraint "product_attribute_pkey" primary key ("id"));`);

    this.addSql(`create table "product_variant" ("id" varchar(255) not null, "name" varchar(255) not null, "sku_code" varchar(255) not null, "price" int not null, "stock" int not null, "is_base" boolean not null, "associated_attributes" jsonb not null, "is_soft_deleted" boolean not null, "product_id" varchar(255) not null, constraint "product_variant_pkey" primary key ("id"));`);

    this.addSql(`alter table "product_attribute" add constraint "product_attribute_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade;`);

    this.addSql(`alter table "product_variant" add constraint "product_variant_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade;`);

    this.addSql(`drop table if exists "product_entity" cascade;`);

    this.addSql(`drop table if exists "product_attribute_entity" cascade;`);

    this.addSql(`drop table if exists "product_variant_entity" cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "product_attribute" drop constraint "product_attribute_product_id_foreign";`);

    this.addSql(`alter table "product_variant" drop constraint "product_variant_product_id_foreign";`);

    this.addSql(`create table "product_entity" ("id" varchar(255) not null, "name" varchar(255) not null, "slug" varchar(255) not null, constraint "product_entity_pkey" primary key ("id"));`);

    this.addSql(`create table "product_attribute_entity" ("id" varchar(255) not null, "key" varchar(255) not null, "values" jsonb not null, "is_soft_deleted" boolean not null, "product_id" varchar(255) not null, constraint "product_attribute_entity_pkey" primary key ("id"));`);

    this.addSql(`create table "product_variant_entity" ("id" varchar(255) not null, "name" varchar(255) not null, "sku_code" varchar(255) not null, "price" int not null, "stock" int not null, "is_base" boolean not null, "associated_attributes" jsonb not null, "is_soft_deleted" boolean not null, "product_id" varchar(255) not null, constraint "product_variant_entity_pkey" primary key ("id"));`);

    this.addSql(`alter table "product_attribute_entity" add constraint "product_attribute_entity_product_id_foreign" foreign key ("product_id") references "product_entity" ("id") on update cascade;`);

    this.addSql(`alter table "product_variant_entity" add constraint "product_variant_entity_product_id_foreign" foreign key ("product_id") references "product_entity" ("id") on update cascade;`);

    this.addSql(`drop table if exists "product" cascade;`);

    this.addSql(`drop table if exists "product_attribute" cascade;`);

    this.addSql(`drop table if exists "product_variant" cascade;`);
  }

}
