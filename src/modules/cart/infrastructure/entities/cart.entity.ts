import {
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Rel,
} from '@mikro-orm/core';
import { CartItemEntity } from './cart-item.entity';
import { AccountEntity } from 'src/modules/account/infrastructure/entities/account.entity';

@Entity({ tableName: 'cart' })
export class CartEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne(() => AccountEntity)
  customer!: Rel<AccountEntity>;

  @OneToMany(() => CartItemEntity, (item) => item.cart, {
    orphanRemoval: true,
  })
  items = new Collection<CartItemEntity>(this);
}
