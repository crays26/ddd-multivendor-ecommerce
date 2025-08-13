import {
  Cascade,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { ProductEntity } from './Product.entity';

@Entity()
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

  @Property({ type: 'json', nullable: false })
  associatedAttributes!: { key: string; value: string }[];

  @ManyToOne(() => ProductEntity)
  product!: ProductEntity;
}
