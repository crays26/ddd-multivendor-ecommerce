import {
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  Opt,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { ProductVariantEntity } from './product-variant.entity';
import { ProductAttributeEntity } from './product-attribute.entity';
import { VendorEntity } from 'src/modules/vendor/infrastructure/entities/vendor.entity';
import { CategoryEntity } from 'src/modules/product/infrastructure/entities/category.entity';
import { FullTextType } from '@mikro-orm/postgresql';

@Entity({ tableName: 'product' })
export class ProductEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  @Index({
    name: 'idx_product_name_trgm',
    expression:
      'CREATE INDEX idx_product_name_trgm ON product USING GIN (name gin_trgm_ops)',
  })
  name!: string;

  @Property()
  slug!: string;

  @Property({ type: 'text', default: '' })
  description?: string & Opt;

  @Property({ type: 'int' })
  displayPrice!: number;

  @ManyToOne(() => VendorEntity)
  vendor!: VendorEntity;

  @ManyToOne(() => CategoryEntity)
  category!: CategoryEntity;

  @OneToMany(() => ProductAttributeEntity, (attribute) => attribute.product)
  attributes = new Collection<ProductAttributeEntity>(this);

  @OneToMany(() => ProductVariantEntity, (variant) => variant.product)
  variants = new Collection<ProductVariantEntity>(this);

  @Index({ type: 'fulltext' })
  @Property({
    name: 'searchable_name',
    type: new FullTextType('english'),
    onCreate: (product: ProductEntity) => product.name,
    onUpdate: (product: ProductEntity) => product.name,
  })
  searchableName!: string;

  @Property({ persist: false, default: 0, name: 'relevance_score' })
  relevanceScore?: number & Opt;
}
