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
import { CheckoutStatus } from '../../domain/aggregate-roots/checkout.agg-root';

@Entity({ tableName: 'checkout' })
export class CheckoutEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne(() => AccountEntity)
  customer!: AccountEntity;

  @Enum(() => CheckoutStatus)
  status!: CheckoutStatus;

  @Property({ type: 'int' })
  totalAmount!: number;

  @Property({ type: 'timestamptz' })
  paymentDueAt!: Date;

  @Property({ type: 'timestamptz', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @OneToMany(() => OrderEntity, (order) => order.checkout)
  orders = new Collection<OrderEntity>(this);
}
