import {
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryKey,
  Property,
  Rel,
} from '@mikro-orm/core';
import { ProductEntity } from './product.entity';
import { InventoryEntity } from 'src/modules/inventory/infrastructure/entities/inventory.entity';

@Entity({ tableName: 'product_variant' })
export class ProductVariantEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  name!: string;

  @Property()
  skuCode!: string;

  @Property({ type: 'int' })
  price!: number;

  @Property({ type: 'int' })
  stock!: number;

  @Property()
  isBase!: boolean;

  @Property({ type: 'jsonb', nullable: false })
  associatedAttributes!: { key: string; value: string }[];

  @Property()
  isSoftDeleted!: boolean;

  @ManyToOne(() => ProductEntity)
  product!: Rel<ProductEntity>;

  @OneToOne(() => InventoryEntity, (inventory) => inventory.productVariant, {
    owner: true,
    nullable: true,
  })
  inventory?: Rel<InventoryEntity>;
}
