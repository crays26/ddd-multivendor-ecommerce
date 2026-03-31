import { Migration } from '@mikro-orm/migrations';

export class Migration20260330130646 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "subtransaction_entity" ("id" uuid not null, "amount" int not null, "status" varchar(255) not null, "transfer_id" varchar(255) null, "transaction_id" uuid not null, constraint "subtransaction_entity_pkey" primary key ("id"));`);

    this.addSql(`alter table "subtransaction_entity" add constraint "subtransaction_entity_transaction_id_foreign" foreign key ("transaction_id") references "transaction" ("id") on update cascade;`);

    this.addSql(`alter table "order" drop constraint if exists "order_status_check";`);

    this.addSql(`alter table "outbox" add column "delay" int not null default 0;`);

    this.addSql(`alter table "order" add column "sub_transaction_id" uuid null;`);
    this.addSql(`alter table "order" add constraint "order_sub_transaction_id_foreign" foreign key ("sub_transaction_id") references "subtransaction_entity" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "order" add constraint "order_status_check" check("status" in ('PENDING', 'STOCK_RESERVED', 'PAID', 'COMPLETED', 'FAILED', 'SHIPPED', 'CANCELLED'));`);
    this.addSql(`alter table "order" add constraint "order_sub_transaction_id_unique" unique ("sub_transaction_id");`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "order" drop constraint "order_sub_transaction_id_foreign";`);

    this.addSql(`drop table if exists "subtransaction_entity" cascade;`);

    this.addSql(`alter table "order" drop constraint if exists "order_status_check";`);

    this.addSql(`alter table "outbox" drop column "delay";`);

    this.addSql(`alter table "order" drop constraint "order_sub_transaction_id_unique";`);
    this.addSql(`alter table "order" drop column "sub_transaction_id";`);

    this.addSql(`alter table "order" add constraint "order_status_check" check("status" in ('PENDING', 'STOCK_RESERVED', 'PAID', 'SHIPPED', 'CANCELLED'));`);
  }

}
