import {
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { ProductAttributeEntity } from 'src/modules/product/infrastructure/entities/product-attribute.entity';
import { ProductEntity } from 'src/modules/product/infrastructure/entities/product.entity';

@Entity({ tableName: 'category' })
export class CategoryEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property()
  name!: string;

  @ManyToOne(() => CategoryEntity, {
    nullable: true,
  })
  parentCategory?: CategoryEntity | null;

  @OneToMany(() => CategoryEntity, (category) => category.parentCategory)
  subCategories = new Collection<CategoryEntity>(this);

  @OneToMany(() => ProductEntity, (product) => product.category)
  products = new Collection<ProductEntity>(this);
}
