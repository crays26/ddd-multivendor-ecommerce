import { Migration } from '@mikro-orm/migrations';

export class Migration20250923124453 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "product_attribute" drop constraint "product_attribute_product_id_foreign";`);

    this.addSql(`alter table "product_variant" drop constraint "product_variant_product_id_foreign";`);

    this.addSql(`alter table "account_roles" drop constraint "account_roles_account_id_foreign";`);
    this.addSql(`alter table "account_roles" drop constraint "account_roles_role_id_foreign";`);

    this.addSql(`alter table "vendor" drop constraint "vendor_account_id_foreign";`);

    this.addSql(`alter table "account" alter column "id" drop default;`);
    this.addSql(`alter table "account" alter column "id" type uuid using ("id"::text::uuid);`);

    this.addSql(`alter table "product" alter column "id" drop default;`);
    this.addSql(`alter table "product" alter column "id" type uuid using ("id"::text::uuid);`);

    this.addSql(`alter table "product_attribute" alter column "id" drop default;`);
    this.addSql(`alter table "product_attribute" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "product_attribute" alter column "product_id" drop default;`);
    this.addSql(`alter table "product_attribute" alter column "product_id" type uuid using ("product_id"::text::uuid);`);
    this.addSql(`alter table "product_attribute" add constraint "product_attribute_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade;`);

    this.addSql(`alter table "product_variant" alter column "id" drop default;`);
    this.addSql(`alter table "product_variant" alter column "id" type uuid using ("id"::text::uuid);`);
    this.addSql(`alter table "product_variant" alter column "product_id" drop default;`);
    this.addSql(`alter table "product_variant" alter column "product_id" type uuid using ("product_id"::text::uuid);`);
    this.addSql(`alter table "product_variant" add constraint "product_variant_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade;`);

    this.addSql(`alter table "role" alter column "id" drop default;`);
    this.addSql(`alter table "role" alter column "id" type uuid using ("id"::text::uuid);`);

    this.addSql(`alter table "account_roles" alter column "account_id" drop default;`);
    this.addSql(`alter table "account_roles" alter column "account_id" type uuid using ("account_id"::text::uuid);`);
    this.addSql(`alter table "account_roles" alter column "role_id" drop default;`);
    this.addSql(`alter table "account_roles" alter column "role_id" type uuid using ("role_id"::text::uuid);`);
    this.addSql(`alter table "account_roles" add constraint "account_roles_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "account_roles" add constraint "account_roles_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "vendor" alter column "account_id" drop default;`);
    this.addSql(`alter table "vendor" alter column "account_id" type uuid using ("account_id"::text::uuid);`);
    this.addSql(`alter table "vendor" add constraint "vendor_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "account" alter column "id" type text using ("id"::text);`);

    this.addSql(`alter table "product" alter column "id" type text using ("id"::text);`);

    this.addSql(`alter table "product_attribute" alter column "id" type text using ("id"::text);`);
    this.addSql(`alter table "product_attribute" alter column "product_id" type text using ("product_id"::text);`);

    this.addSql(`alter table "product_attribute" drop constraint "product_attribute_product_id_foreign";`);

    this.addSql(`alter table "product_variant" alter column "id" type text using ("id"::text);`);
    this.addSql(`alter table "product_variant" alter column "product_id" type text using ("product_id"::text);`);

    this.addSql(`alter table "product_variant" drop constraint "product_variant_product_id_foreign";`);

    this.addSql(`alter table "role" alter column "id" type text using ("id"::text);`);

    this.addSql(`alter table "account_roles" alter column "account_id" type text using ("account_id"::text);`);
    this.addSql(`alter table "account_roles" alter column "role_id" type text using ("role_id"::text);`);

    this.addSql(`alter table "account_roles" drop constraint "account_roles_account_id_foreign";`);
    this.addSql(`alter table "account_roles" drop constraint "account_roles_role_id_foreign";`);

    this.addSql(`alter table "vendor" alter column "account_id" type text using ("account_id"::text);`);

    this.addSql(`alter table "vendor" drop constraint "vendor_account_id_foreign";`);

    this.addSql(`alter table "account" alter column "id" type varchar(255) using ("id"::varchar(255));`);

    this.addSql(`alter table "product" alter column "id" type varchar(255) using ("id"::varchar(255));`);

    this.addSql(`alter table "product_attribute" alter column "id" type varchar(255) using ("id"::varchar(255));`);
    this.addSql(`alter table "product_attribute" alter column "product_id" type varchar(255) using ("product_id"::varchar(255));`);
    this.addSql(`alter table "product_attribute" add constraint "product_attribute_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade;`);

    this.addSql(`alter table "product_variant" alter column "id" type varchar(255) using ("id"::varchar(255));`);
    this.addSql(`alter table "product_variant" alter column "product_id" type varchar(255) using ("product_id"::varchar(255));`);
    this.addSql(`alter table "product_variant" add constraint "product_variant_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade;`);

    this.addSql(`alter table "role" alter column "id" type varchar(255) using ("id"::varchar(255));`);

    this.addSql(`alter table "account_roles" alter column "account_id" type varchar(255) using ("account_id"::varchar(255));`);
    this.addSql(`alter table "account_roles" alter column "role_id" type varchar(255) using ("role_id"::varchar(255));`);
    this.addSql(`alter table "account_roles" add constraint "account_roles_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "account_roles" add constraint "account_roles_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade on delete cascade;`);

    this.addSql(`alter table "vendor" alter column "account_id" type varchar(255) using ("account_id"::varchar(255));`);
    this.addSql(`alter table "vendor" add constraint "vendor_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`);
  }

}
