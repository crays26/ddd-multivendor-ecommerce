import {
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryKey,
  Property,
  Rel,
} from '@mikro-orm/core';
import { TransactionEntity } from './transaction.entity';
import { SubTransactionStatus } from '../../domain/entities/sub-transaction.entity';
import { OrderEntity } from 'src/modules/order/infrastructure/entities/order.entity';

@Entity()
export class SubtransactionEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  amount!: number;

  @Property()
  status!: SubTransactionStatus;

  @Property({ nullable: true })
  transferId?: string;

  @ManyToOne(() => TransactionEntity)
  transaction!: Rel<TransactionEntity>;

  @OneToOne(() => OrderEntity, (order) => order.subTransaction)
  order!: Rel<OrderEntity>;
}
