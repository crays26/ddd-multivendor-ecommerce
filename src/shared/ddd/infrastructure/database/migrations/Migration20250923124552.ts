import { Migration } from '@mikro-orm/migrations';

export class Migration20250923124552 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "vendor" alter column "id" drop default;`);
    this.addSql(`alter table "vendor" alter column "id" type uuid using ("id"::text::uuid);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "vendor" alter column "id" type text using ("id"::text);`);

    this.addSql(`alter table "vendor" alter column "id" type varchar(255) using ("id"::varchar(255));`);
  }

}
