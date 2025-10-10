import {
  Collection,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { Account } from 'src/modules/account/infrastructure/entities/account.entity';
import { ProductEntity } from 'src/modules/product/infrastructure/entities/product.entity';

@Entity({ tableName: 'vendor' })
export class VendorEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  @Unique()
  name!: string;

  @Property()
  @Unique()
  slug!: string;

  @Property({ type: 'text' })
  description!: string;

  @Property({ type: 'double precision' })
  rating!: number;

  @OneToOne(() => Account, (account) => account.vendor, { owner: true })
  account!: Account;

  @OneToMany(() => ProductEntity, (product) => product.vendor)
  products = new Collection<ProductEntity>(this);
}
