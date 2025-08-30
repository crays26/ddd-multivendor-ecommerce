import {
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { ProductEntity } from './Product.entity';

@Entity({ tableName: 'product_attribute' })
export class ProductAttributeEntity {
  @PrimaryKey()
  id!: string;

  @Property()
  key!: string;

  @Property({ type: 'json', nullable: false })
  values!: string[];

  @Property()
  isSoftDeleted!: boolean;

  @ManyToOne(() => ProductEntity)
  product!: ProductEntity;
}
