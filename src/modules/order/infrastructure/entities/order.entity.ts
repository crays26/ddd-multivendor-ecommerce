import {
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
import { OrderGroupEntity } from './order-group.entity';

@Entity({ tableName: 'order' })
export class OrderEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'int' })
  totalAmount: number;

  @Enum(() => OrderStatus)
  status: OrderStatus;

  @ManyToOne(() => VendorEntity)
  vendor!: VendorEntity;

  @ManyToOne(() => AccountEntity)
  customer!: AccountEntity;

  @ManyToOne(() => OrderGroupEntity)
  orderGroup!: OrderGroupEntity;

  @OneToMany(() => OrderLineItemEntity, (lineItem) => lineItem.order, {
    orphanRemoval: true,
  })
  lineItems = new Collection<OrderLineItemEntity>(this);
}
