import { Entity, OneToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { ProductVariantEntity } from 'src/modules/product/infrastructure/entities/product-variant.entity';

@Entity({ tableName: 'inventory' })
export class InventoryEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @OneToOne(
    () => ProductVariantEntity,
    (productVariant) => productVariant.inventory,
    {
      orphanRemoval: true,
    },
  )
  productVariant!: Rel<ProductVariantEntity>;

  @Property({ type: 'int', default: 0 })
  quantity!: number;

  @Property({ type: 'int', default: 0 })
  reservedQuantity!: number;

  @Property({ type: 'timestamptz', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Property({
    type: 'timestamptz',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;
}
