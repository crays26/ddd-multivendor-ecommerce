import { Migration } from '@mikro-orm/migrations';

export class Migration20260320142319 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "inventory" drop constraint "inventory_variant_id_unique";`);
    this.addSql(`alter table "inventory" drop column "variant_id";`);

    this.addSql(`alter table "inventory" add column "product_variant_id" uuid not null;`);
    this.addSql(`alter table "inventory" add constraint "inventory_product_variant_id_foreign" foreign key ("product_variant_id") references "product_variant" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "inventory" drop constraint "inventory_product_variant_id_foreign";`);

    this.addSql(`alter table "inventory" drop column "product_variant_id";`);

    this.addSql(`alter table "inventory" add column "variant_id" uuid not null;`);
    this.addSql(`alter table "inventory" add constraint "inventory_variant_id_unique" unique ("variant_id");`);
  }

}
