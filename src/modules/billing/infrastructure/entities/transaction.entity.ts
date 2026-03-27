import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  Rel,
} from '@mikro-orm/core';
import { BillingCustomerEntity } from './billing-customer.entity';
import { CheckoutEntity } from 'src/modules/order/infrastructure/entities/checkout.entity';
import { SubtransactionEntity } from './subtransaction.entity';
import { TransactionStatus } from '../../domain/aggregate-roots/transaction.agg-root';

@Entity({ tableName: 'transaction' })
export class TransactionEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  amount!: number;

  @Property()
  currency!: string;

  @Property()
  provider!: string;

  @Property()
  status!: TransactionStatus;

  @Property({ nullable: true })
  providerIntentId?: string;

  @Property({ nullable: true })
  clientSecret?: string;

  @Property({ nullable: true })
  paymentMethod?: string;

  @ManyToOne(() => BillingCustomerEntity, { nullable: true })
  billingCustomer?: Rel<BillingCustomerEntity>;

  @OneToOne(() => CheckoutEntity)
  checkout!: Rel<CheckoutEntity>;

  @OneToMany(
    () => SubtransactionEntity,
    (subtransaction) => subtransaction.transaction,
  )
  subtransactions = new Collection<SubtransactionEntity>(this);
}
