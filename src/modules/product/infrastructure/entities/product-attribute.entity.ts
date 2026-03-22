import { Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import type { ProductEntity } from './product.entity';

@Entity({ tableName: 'product_attribute' })
export class ProductAttributeEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  key!: string;

  @Property({ type: 'jsonb', nullable: false })
  values!: string[];

  @Property()
  isSoftDeleted!: boolean;

  @ManyToOne(() => 'ProductEntity')
  product!: Rel<ProductEntity>;
}
