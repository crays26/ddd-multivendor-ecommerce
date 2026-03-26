import { Migration } from '@mikro-orm/migrations';

export class Migration20260323133702 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "inventory" drop constraint "inventory_product_variant_id_foreign";`);

    this.addSql(`alter table "inventory" drop column "product_variant_id";`);

    this.addSql(`alter table "product_variant" add column "inventory_id" uuid null;`);
    this.addSql(`alter table "product_variant" add constraint "product_variant_inventory_id_foreign" foreign key ("inventory_id") references "inventory" ("id") on update cascade;`);
    this.addSql(`alter table "product_variant" add constraint "product_variant_inventory_id_unique" unique ("inventory_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "product_variant" drop constraint "product_variant_inventory_id_foreign";`);

    this.addSql(`alter table "product_variant" drop constraint "product_variant_inventory_id_unique";`);
    this.addSql(`alter table "product_variant" drop column "inventory_id";`);

    this.addSql(`alter table "inventory" add column "product_variant_id" uuid not null;`);
    this.addSql(`alter table "inventory" add constraint "inventory_product_variant_id_foreign" foreign key ("product_variant_id") references "product_variant" ("id") on update cascade;`);
  }

}
