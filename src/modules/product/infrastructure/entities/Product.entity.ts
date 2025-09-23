import { Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Collection } from '@mikro-orm/core';
import { ProductVariantEntity } from './ProductVariant.entity';
import { ProductAttributeEntity } from './ProductAttribute.entity';

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
   
   @OneToMany(() => ProductAttributeEntity, attribute => attribute.product)
   attributes = new Collection<ProductAttributeEntity>(this);

   @OneToMany(() => ProductVariantEntity, variant => variant.product)
   variants = new Collection<ProductVariantEntity>(this);


}