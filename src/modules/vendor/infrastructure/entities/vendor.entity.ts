import {
  Collection,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
  Rel,
  Unique,
} from '@mikro-orm/core';
import { AccountEntity } from 'src/modules/account/infrastructure/entities/account.entity';
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

  @OneToOne(() => AccountEntity, (account) => account.vendor, { owner: true })
  account!: Rel<AccountEntity>;

  @OneToMany(() => ProductEntity, (product) => product.vendor)
  products = new Collection<ProductEntity>(this);
}
