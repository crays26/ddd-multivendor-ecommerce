import { Migration } from '@mikro-orm/migrations';

export class Migration20250822141220 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "product_attribute_entity" add column "is_soft_deleted" boolean not null;`);

    this.addSql(`alter table "product_variant_entity" add column "is_base" boolean not null, add column "is_soft_deleted" boolean not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "product_attribute_entity" drop column "is_soft_deleted";`);

    this.addSql(`alter table "product_variant_entity" drop column "is_base", drop column "is_soft_deleted";`);
  }

}
