import { Migration } from '@mikro-orm/migrations';

export class Migration20260323133854 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "product_variant" drop constraint "product_variant_inventory_id_foreign";`);

    this.addSql(`alter table "product_variant" alter column "inventory_id" drop default;`);
    this.addSql(`alter table "product_variant" alter column "inventory_id" type uuid using ("inventory_id"::text::uuid);`);
    this.addSql(`alter table "product_variant" alter column "inventory_id" drop not null;`);
    this.addSql(`alter table "product_variant" add constraint "product_variant_inventory_id_foreign" foreign key ("inventory_id") references "inventory" ("id") on update cascade on delete set null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "product_variant" drop constraint "product_variant_inventory_id_foreign";`);

    this.addSql(`alter table "product_variant" alter column "inventory_id" drop default;`);
    this.addSql(`alter table "product_variant" alter column "inventory_id" type uuid using ("inventory_id"::text::uuid);`);
    this.addSql(`alter table "product_variant" alter column "inventory_id" set not null;`);
    this.addSql(`alter table "product_variant" add constraint "product_variant_inventory_id_foreign" foreign key ("inventory_id") references "inventory" ("id") on update cascade;`);
  }

}
