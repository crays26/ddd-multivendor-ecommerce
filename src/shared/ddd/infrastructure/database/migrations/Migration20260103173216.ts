import { Migration } from '@mikro-orm/migrations';

export class Migration20260103173216 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "product" add column "display_price" int not null, add column "searchable_name" tsvector not null;`,
    );
    this.addSql(
      `CREATE INDEX idx_product_name_trgm ON product USING GIN (name gin_trgm_ops);`,
    );
    this.addSql(
      `create index "product_searchable_name_index" on "public"."product" using gin("searchable_name");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop index "idx_product_name_trgm";`);
    this.addSql(`drop index "product_searchable_name_index";`);
    this.addSql(
      `alter table "product" drop column "display_price", drop column "searchable_name";`,
    );
  }
}
