import {
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Collection,
} from '@mikro-orm/core';
import { OrderEntity } from './order.entity';
import { AccountEntity } from 'src/modules/account/infrastructure/entities/account.entity';
import { OrderGroupStatus } from '../../domain/entities/order-group.entity';

@Entity({ tableName: 'order_group' })
export class OrderGroupEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne(() => AccountEntity)
  customer!: AccountEntity;

  @Enum(() => OrderGroupStatus)
  status!: OrderGroupStatus;

  @Property({ type: 'int' })
  totalAmount!: number;

  @Property({ type: 'timestamptz' })
  paymentDueAt!: Date;

  @Property({ type: 'timestamptz', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @OneToMany(() => OrderEntity, (order) => order.orderGroup)
  orders = new Collection<OrderEntity>(this);
}
