import { Migration } from '@mikro-orm/migrations';

export class Migration20260331153555 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "checkout" drop constraint if exists "checkout_status_check";`);

    this.addSql(`alter table "order" drop constraint if exists "order_status_check";`);

    this.addSql(`alter table "checkout" add constraint "checkout_status_check" check("status" in ('PENDING', 'STOCK_RESERVED', 'PAID', 'COMPLETED', 'FAILED', 'CANCELLED'));`);

    this.addSql(`alter table "order" add constraint "order_status_check" check("status" in ('PENDING', 'STOCK_RESERVED', 'PAID', 'COMPLETED', 'FAILED', 'CANCELLED'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "checkout" drop constraint if exists "checkout_status_check";`);

    this.addSql(`alter table "order" drop constraint if exists "order_status_check";`);

    this.addSql(`alter table "checkout" add constraint "checkout_status_check" check("status" in ('PENDING', 'STOCK_RESERVED', 'INSUFFICIENT_STOCK', 'PAYMENT_SUCCEEDED', 'PAYMENT_FAILED', 'COMPLETED', 'CANCELLED'));`);

    this.addSql(`alter table "order" add constraint "order_status_check" check("status" in ('PENDING', 'STOCK_RESERVED', 'PAID', 'COMPLETED', 'FAILED', 'SHIPPED', 'CANCELLED'));`);
  }

}
