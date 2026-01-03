import { Migration } from '@mikro-orm/migrations';
import { v7 as uuidv7 } from 'uuid';
export class Migration20251227130810 extends Migration {

  override async up(): Promise<void> {
    // Enable PostgreSQL extensions for text search
    this.addSql(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    this.addSql(`CREATE EXTENSION IF NOT EXISTS unaccent;`);

    this.addSql(`create table "account" ("id" uuid not null, "email" varchar(255) not null, "username" varchar(255) not null, "password" varchar(255) not null, constraint "account_pkey" primary key ("id"));`);
    this.addSql(`alter table "account" add constraint "account_email_unique" unique ("email");`);

    this.addSql(`create table "address" ("id" uuid not null, "full_name" varchar(255) not null, "phone_number" varchar(255) not null, "street" varchar(255) not null, "unit" varchar(255) null, "ward" varchar(255) null, "city" varchar(255) not null, "region" varchar(255) not null, "postal_code" varchar(255) not null, "country_code" varchar(255) not null, "is_default" boolean not null default false, "label" varchar(255) not null, "account_id" uuid not null, constraint "address_pkey" primary key ("id"));`);

    this.addSql(`create table "billing_customer" ("id" uuid not null, "account_id" uuid not null, "provider_customer_id" varchar(255) null, "default_payment_method_id" varchar(255) null, constraint "billing_customer_pkey" primary key ("id"));`);
    this.addSql(`alter table "billing_customer" add constraint "billing_customer_account_id_unique" unique ("account_id");`);
    this.addSql(`alter table "billing_customer" add constraint "billing_customer_provider_customer_id_unique" unique ("provider_customer_id");`);

    this.addSql(`create table "category" ("id" uuid not null, "name" varchar(255) not null, "parent_category_id" uuid null, constraint "category_pkey" primary key ("id"));`);

    this.addSql(`create table "role" ("id" uuid not null, "name" varchar(255) not null, constraint "role_pkey" primary key ("id"));`);
    this.addSql(`alter table "role" add constraint "role_name_unique" unique ("name");`);

    const adminId = uuidv7();
    const vendorId = uuidv7();
    const customerId = uuidv7();

    this.addSql(`
      INSERT INTO "role" (id, name) VALUES 
      ('${adminId}', 'Admin'),
      ('${vendorId}', 'Vendor'),
      ('${customerId}', 'Customer')
      ON CONFLICT (name) DO NOTHING;
    `);
  

    this.addSql(`create table "account_roles" ("account_id" uuid not null, "role_id" uuid not null, constraint "account_roles_pkey" primary key ("account_id", "role_id"));`);

    this.addSql(`create table "vendor" ("id" uuid not null, "name" varchar(255) not null, "slug" varchar(255) not null, "description" text not null, "rating" double precision not null, "account_id" uuid not null, constraint "vendor_pkey" primary key ("id"));`);
    this.addSql(`alter table "vendor" add constraint "vendor_name_unique" unique ("name");`);
    this.addSql(`alter table "vendor" add constraint "vendor_slug_unique" unique ("slug");`);
    this.addSql(`alter table "vendor" add constraint "vendor_account_id_unique" unique ("account_id");`);

    this.addSql(`create table "product" ("id" uuid not null, "name" varchar(255) not null, "slug" varchar(255) not null, "description" text not null default '', "vendor_id" uuid not null, "category_id" uuid not null, constraint "product_pkey" primary key ("id"));`);

    this.addSql(`create table "product_variant" ("id" uuid not null, "name" varchar(255) not null, "sku_code" varchar(255) not null, "price" int not null, "stock" int not null, "is_base" boolean not null, "associated_attributes" jsonb not null, "is_soft_deleted" boolean not null, "product_id" uuid not null, constraint "product_variant_pkey" primary key ("id"));`);

    this.addSql(`create table "product_attribute" ("id" uuid not null, "key" varchar(255) not null, "values" jsonb not null, "is_soft_deleted" boolean not null, "product_id" uuid not null, constraint "product_attribute_pkey" primary key ("id"));`);

    this.addSql(`create table "order" ("id" uuid not null, "total_amount" numeric(10,2) not null, "status" text check ("status" in ('PENDING', 'PAID', 'SHIPPED', 'CANCELLED')) not null, "vendor_id" uuid not null, "customer_id" uuid not null, constraint "order_pkey" primary key ("id"));`);

    this.addSql(`create table "order_line_item" ("id" uuid not null, "price" numeric(10,2) not null, "quantity" int not null, "order_id" uuid not null, "product_variant_id" uuid not null, constraint "order_line_item_pkey" primary key ("id"));`);

    this.addSql(`create table "billing_vendor" ("id" uuid not null, "vendor_id" uuid not null, "provider_account_id" varchar(255) null, constraint "billing_vendor_pkey" primary key ("id"));`);
    this.addSql(`alter table "billing_vendor" add constraint "billing_vendor_vendor_id_unique" unique ("vendor_id");`);
    this.addSql(`alter table "billing_vendor" add constraint "billing_vendor_provider_account_id_unique" unique ("provider_account_id");`);

    this.addSql(`create table "transaction" ("id" uuid not null, "order_id" varchar(255) not null, "amount" int not null, "currency" varchar(255) not null, "provider" varchar(255) not null, "status" varchar(255) not null, "provider_intent_id" varchar(255) null, "client_secret" varchar(255) null, "payment_method" varchar(255) null, "billing_customer_id" uuid null, "billing_vendor_id" uuid null, constraint "transaction_pkey" primary key ("id"));`);

    this.addSql(`alter table "address" add constraint "address_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`);

    this.addSql(`alter table "billing_customer" add constraint "billing_customer_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`);

    this.addSql(`alter table "category" add constraint "category_parent_category_id_foreign" foreign key ("parent_category_id") references "category" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "account_roles" add constraint "account_roles_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "account_roles" add constraint "account_roles_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "vendor" add constraint "vendor_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`);

    this.addSql(`alter table "product" add constraint "product_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);
    this.addSql(`alter table "product" add constraint "product_category_id_foreign" foreign key ("category_id") references "category" ("id") on update cascade;`);

    this.addSql(`alter table "product_variant" add constraint "product_variant_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade;`);

    this.addSql(`alter table "product_attribute" add constraint "product_attribute_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade;`);

    this.addSql(`alter table "order" add constraint "order_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);
    this.addSql(`alter table "order" add constraint "order_customer_id_foreign" foreign key ("customer_id") references "account" ("id") on update cascade;`);

    this.addSql(`alter table "order_line_item" add constraint "order_line_item_order_id_foreign" foreign key ("order_id") references "order" ("id") on update cascade;`);
    this.addSql(`alter table "order_line_item" add constraint "order_line_item_product_variant_id_foreign" foreign key ("product_variant_id") references "product_variant" ("id") on update cascade;`);

    this.addSql(`alter table "billing_vendor" add constraint "billing_vendor_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);

    this.addSql(`alter table "transaction" add constraint "transaction_billing_customer_id_foreign" foreign key ("billing_customer_id") references "billing_customer" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "transaction" add constraint "transaction_billing_vendor_id_foreign" foreign key ("billing_vendor_id") references "billing_vendor" ("id") on update cascade on delete set null;`);
  }

}
