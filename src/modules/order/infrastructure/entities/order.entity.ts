import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Enum,
  Rel,
  OneToOne,
} from '@mikro-orm/core';
import { OrderLineItemEntity } from 'src/modules/order/infrastructure/entities/order-line-item.entity';
import { VendorEntity } from 'src/modules/vendor/infrastructure/entities/vendor.entity';
import { AccountEntity } from 'src/modules/account/infrastructure/entities/account.entity';
import { OrderStatus } from 'src/modules/order/domain/aggregate-roots/order.agg-root';
import { CheckoutEntity } from './checkout.entity';
import { SubtransactionEntity } from 'src/modules/billing/infrastructure/entities/subtransaction.entity';

@Entity({ tableName: 'order' })
export class OrderEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'int' })
  totalAmount!: number;

  @Enum(() => OrderStatus)
  status!: OrderStatus;

  @ManyToOne(() => VendorEntity)
  vendor!: Rel<VendorEntity>;

  @ManyToOne(() => AccountEntity)
  customer!: Rel<AccountEntity>;

  @ManyToOne(() => CheckoutEntity)
  checkout!: Rel<CheckoutEntity>;

  @OneToMany(() => OrderLineItemEntity, (lineItem) => lineItem.order, {
    orphanRemoval: true,
  })
  lineItems = new Collection<OrderLineItemEntity>(this);

  @OneToOne(
    () => SubtransactionEntity,
    (subTransaction) => subTransaction.order,
    {
      owner: true,
      nullable: true,
    },
  )
  subTransaction?: Rel<SubtransactionEntity>;
}
