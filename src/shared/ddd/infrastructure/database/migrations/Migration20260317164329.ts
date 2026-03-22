import { Migration } from '@mikro-orm/migrations';

export class Migration20260317164329 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "cart" ("id" uuid not null, "customer_id" uuid not null, constraint "cart_pkey" primary key ("id"));`);

    this.addSql(`create table "checkout" ("id" uuid not null, "customer_id" uuid not null, "status" text check ("status" in ('PENDING', 'STOCK_RESERVED', 'INSUFFICIENT_STOCK', 'PAYMENT_SUCCEEDED', 'PAYMENT_FAILED', 'COMPLETED', 'CANCELLED')) not null, "total_amount" int not null, "payment_due_at" timestamptz not null, "created_at" timestamptz not null default CURRENT_TIMESTAMP, constraint "checkout_pkey" primary key ("id"));`);

    this.addSql(`create table "inventory" ("id" uuid not null, "variant_id" uuid not null, "quantity" int not null default 0, "reserved_quantity" int not null default 0, "created_at" timestamptz not null default CURRENT_TIMESTAMP, "updated_at" timestamptz not null default CURRENT_TIMESTAMP, constraint "inventory_pkey" primary key ("id"));`);
    this.addSql(`alter table "inventory" add constraint "inventory_variant_id_unique" unique ("variant_id");`);

    this.addSql(`create table "cart_item" ("id" uuid not null, "product_variant_id" uuid not null, "quantity" int not null, "cart_id" uuid not null, constraint "cart_item_pkey" primary key ("id"));`);

    this.addSql(`alter table "cart" add constraint "cart_customer_id_foreign" foreign key ("customer_id") references "account" ("id") on update cascade;`);

    this.addSql(`alter table "checkout" add constraint "checkout_customer_id_foreign" foreign key ("customer_id") references "account" ("id") on update cascade;`);

    this.addSql(`alter table "cart_item" add constraint "cart_item_product_variant_id_foreign" foreign key ("product_variant_id") references "product_variant" ("id") on update cascade;`);
    this.addSql(`alter table "cart_item" add constraint "cart_item_cart_id_foreign" foreign key ("cart_id") references "cart" ("id") on update cascade;`);

    this.addSql(`alter table "transaction" drop constraint "transaction_billing_vendor_id_foreign";`);

    this.addSql(`alter table "order" drop constraint if exists "order_status_check";`);

    this.addSql(`alter table "transaction" drop column "order_id", drop column "billing_vendor_id";`);

    this.addSql(`alter table "transaction" add column "checkout_id" uuid not null;`);
    this.addSql(`alter table "transaction" add constraint "transaction_checkout_id_foreign" foreign key ("checkout_id") references "checkout" ("id") on update cascade;`);
    this.addSql(`alter table "transaction" add constraint "transaction_checkout_id_unique" unique ("checkout_id");`);

    this.addSql(`alter table "order" add column "checkout_id" uuid not null;`);
    this.addSql(`alter table "order" alter column "total_amount" type int using ("total_amount"::int);`);
    this.addSql(`alter table "order" add constraint "order_checkout_id_foreign" foreign key ("checkout_id") references "checkout" ("id") on update cascade;`);
    this.addSql(`alter table "order" add constraint "order_status_check" check("status" in ('PENDING', 'STOCK_RESERVED', 'PAID', 'SHIPPED', 'CANCELLED'));`);

    this.addSql(`alter table "order_line_item" alter column "price" type int using ("price"::int);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "cart_item" drop constraint "cart_item_cart_id_foreign";`);

    this.addSql(`alter table "transaction" drop constraint "transaction_checkout_id_foreign";`);

    this.addSql(`alter table "order" drop constraint "order_checkout_id_foreign";`);

    this.addSql(`drop table if exists "cart" cascade;`);

    this.addSql(`drop table if exists "checkout" cascade;`);

    this.addSql(`drop table if exists "inventory" cascade;`);

    this.addSql(`drop table if exists "cart_item" cascade;`);

    this.addSql(`alter table "order" drop constraint if exists "order_status_check";`);

    this.addSql(`alter table "order" drop column "checkout_id";`);

    this.addSql(`alter table "order" alter column "total_amount" type numeric(10,2) using ("total_amount"::numeric(10,2));`);
    this.addSql(`alter table "order" add constraint "order_status_check" check("status" in ('PENDING', 'PAID', 'SHIPPED', 'CANCELLED'));`);

    this.addSql(`alter table "order_line_item" alter column "price" type numeric(10,2) using ("price"::numeric(10,2));`);

    this.addSql(`alter table "transaction" drop constraint "transaction_checkout_id_unique";`);
    this.addSql(`alter table "transaction" drop column "checkout_id";`);

    this.addSql(`alter table "transaction" add column "order_id" varchar(255) not null, add column "billing_vendor_id" uuid null;`);
    this.addSql(`alter table "transaction" add constraint "transaction_billing_vendor_id_foreign" foreign key ("billing_vendor_id") references "billing_vendor" ("id") on update cascade on delete set null;`);
  }

}
