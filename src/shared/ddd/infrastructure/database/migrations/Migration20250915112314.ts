import { Migration } from '@mikro-orm/migrations';

export class Migration20250915112314 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "vendor" ("id" varchar(255) not null, "name" varchar(255) not null, "slug" varchar(255) not null, "description" text not null, "rating" double precision not null, "account_id" varchar(255) not null, constraint "vendor_pkey" primary key ("id"));`);
    this.addSql(`alter table "vendor" add constraint "vendor_name_unique" unique ("name");`);
    this.addSql(`alter table "vendor" add constraint "vendor_slug_unique" unique ("slug");`);
    this.addSql(`alter table "vendor" add constraint "vendor_account_id_unique" unique ("account_id");`);

    this.addSql(`alter table "vendor" add constraint "vendor_account_id_foreign" foreign key ("account_id") references "account" ("id") on update cascade;`);

    this.addSql(`alter table "product" add column "description" text not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "vendor" cascade;`);

    this.addSql(`alter table "product" drop column "description";`);
  }

}
