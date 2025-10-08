import { Migration } from '@mikro-orm/migrations';

export class Migration20251008144218 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    this.addSql(
      `create table "category" ("id" uuid not null, "name" varchar(255) not null, "parent_category_id" uuid null, constraint "category_pkey" primary key ("id"));`,
    );

    this.addSql(
      `alter table "category" add constraint "category_parent_category_id_foreign" foreign key ("parent_category_id") references "category" ("id") on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table "product" add column "vendor_id" uuid not null, add column "category_id" uuid not null;`,
    );
    this.addSql(
      `alter table "product" alter column "description" type text using ("description"::text);`,
    );
    this.addSql(
      `alter table "product" alter column "description" set default '';`,
    );
    this.addSql(
      `alter table "product" alter column "description" set not null;`,
    );
    this.addSql(
      `alter table "product" add constraint "product_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "product" add constraint "product_category_id_foreign" foreign key ("category_id") references "category" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "category" drop constraint "category_parent_category_id_foreign";`,
    );

    this.addSql(
      `alter table "product" drop constraint "product_category_id_foreign";`,
    );

    this.addSql(`drop table if exists "category" cascade;`);

    this.addSql(
      `alter table "product" drop constraint "product_vendor_id_foreign";`,
    );

    this.addSql(
      `alter table "product" drop column "vendor_id", drop column "category_id";`,
    );

    this.addSql(
      `alter table "product" alter column "description" drop default;`,
    );
    this.addSql(
      `alter table "product" alter column "description" type text using ("description"::text);`,
    );
    this.addSql(
      `alter table "product" alter column "description" drop not null;`,
    );
  }
}
