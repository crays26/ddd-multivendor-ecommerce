import { Migration } from '@mikro-orm/migrations';

export class Migration20251120145504 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "order" ("id" uuid not null, "total_amount" numeric(10,2) not null, "status" text check ("status" in ('PENDING', 'PAID', 'SHIPPED', 'CANCELLED')) not null, "vendor_id" uuid not null, "customer_id" uuid not null, constraint "order_pkey" primary key ("id"));`);

    this.addSql(`create table "order_line_item" ("id" uuid not null, "price" numeric(10,2) not null, "quantity" int not null, "order_id" uuid not null, "product_variant_id" uuid not null, constraint "order_line_item_pkey" primary key ("id"));`);

    this.addSql(`alter table "order" add constraint "order_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);
    this.addSql(`alter table "order" add constraint "order_customer_id_foreign" foreign key ("customer_id") references "account" ("id") on update cascade;`);

    this.addSql(`alter table "order_line_item" add constraint "order_line_item_order_id_foreign" foreign key ("order_id") references "order" ("id") on update cascade;`);
    this.addSql(`alter table "order_line_item" add constraint "order_line_item_product_variant_id_foreign" foreign key ("product_variant_id") references "product_variant" ("id") on update cascade;`);

    this.addSql(`alter table "account_roles" drop constraint "account_roles_account_id_foreign";`);
    this.addSql(`alter table "account_roles" drop constraint "account_roles_role_id_foreign";`);

    this.addSql(`alter table "account_roles" drop constraint "account_roles_pkey";`);
    this.addSql(`alter table "account_roles" drop column "account_id", drop column "role_id";`);

    this.addSql(`alter table "account_roles" add column "account_entity_id" uuid not null, add column "role_entity_id" uuid not null;`);
    this.addSql(`alter table "account_roles" add constraint "account_roles_account_entity_id_foreign" foreign key ("account_entity_id") references "account" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "account_roles" add constraint "account_roles_role_entity_id_foreign" foreign key ("role_entity_id") references "role" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "account_roles" add constraint "account_roles_pkey" primary key ("account_entity_id", "role_entity_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "order_line_item" drop constraint "order_line_item_order_id_foreign";`);

    this.addSql(`drop table if exists "order" cascade;`);

    this.addSql(`drop table if exists "order_line_item" cascade;`);

    this.addSql(`alter table "account_roles" drop constraint "account_roles_account_entity_id_foreign";`);
    this.addSql(`alter table "account_roles" drop constraint "account_roles_role_entity_id_foreign";`);

    this.addSql(`alter table "account_roles" drop constraint "account_roles_pkey";`);
    this.addSql(`alter table "account_roles" drop column "account_entity_id", drop column "role_entity_id";`);

    this.addSql(`alter table "account_roles" add column "account_id" uuid not null, add column "role_id" uuid not null;`);
    this.addSql(`alter table "account_roles" add constraint "account_roles_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "account_roles" add constraint "account_roles_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "account_roles" add constraint "account_roles_pkey" primary key ("account_id", "role_id");`);
  }

}
