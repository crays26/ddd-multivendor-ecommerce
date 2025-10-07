import {
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { ProductVariantEntity } from './product-variant.entity';
import { ProductAttributeEntity } from './product-attribute.entity';
import { VendorEntity } from 'src/modules/vendor/infrastructure/entities/vendor.entity';

@Entity({ tableName: 'product' })
export class ProductEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  name!: string;

  @Property()
  slug!: string;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => VendorEntity)
  vendor!: VendorEntity;

  @OneToMany(() => ProductAttributeEntity, (attribute) => attribute.product)
  attributes = new Collection<ProductAttributeEntity>(this);

  @OneToMany(() => ProductVariantEntity, (variant) => variant.product)
  variants = new Collection<ProductVariantEntity>(this);
}
