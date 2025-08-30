import {
  Cascade,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { ProductEntity } from './Product.entity';

@Entity({ tableName: 'product_variant' })
export class ProductVariantEntity {
  @PrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @Property()
  skuCode!: string;

  @Property()
  price!: number;

  @Property()
  stock!: number;

  @Property()
  isBase!: boolean;

  @Property({ type: 'json', nullable: false })
  associatedAttributes!: { key: string; value: string }[];

  @Property()
  isSoftDeleted!: boolean;

  @ManyToOne(() => ProductEntity)
  product!: ProductEntity;
}
