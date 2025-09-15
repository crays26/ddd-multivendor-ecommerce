import { Migration } from '@mikro-orm/migrations';

export class Migration20250915112403 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "product" alter column "description" type text using ("description"::text);`);
    this.addSql(`alter table "product" alter column "description" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "product" alter column "description" type text using ("description"::text);`);
    this.addSql(`alter table "product" alter column "description" set not null;`);
  }

}
