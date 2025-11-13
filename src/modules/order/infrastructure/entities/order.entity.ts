import {
  Cascade,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Enum,
} from '@mikro-orm/core';
import { OrderLineItemEntity } from 'src/modules/order/infrastructure/entities/order-line-item.entity';
import { VendorEntity } from 'src/modules/vendor/infrastructure/entities/vendor.entity';
import { AccountEntity } from 'src/modules/account/infrastructure/entities/account.entity';
import { OrderStatus } from 'src/modules/order/domain/aggregate-roots/order.agg-root';

@Entity({ tableName: 'order' })
export class OrderEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Enum(() => OrderStatus)
  status: OrderStatus;

  @ManyToOne(() => VendorEntity)
  vendor!: VendorEntity;

  @ManyToOne(() => AccountEntity)
  customer!: AccountEntity;

  @OneToMany(() => OrderLineItemEntity, (lineItem) => lineItem.order, {
    orphanRemoval: true,
  })
  lineItems = new Collection<OrderLineItemEntity>(this);
}
