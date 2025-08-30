import { Migration } from '@mikro-orm/migrations';

export class Migration20250816055822 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "account" add constraint "account_email_unique" unique ("email");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "account" drop constraint "account_email_unique";`);
  }

}
