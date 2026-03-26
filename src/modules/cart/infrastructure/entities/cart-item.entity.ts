import { Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core';
import { CartEntity } from './cart.entity';
import { ProductVariantEntity } from 'src/modules/product/infrastructure/entities/product-variant.entity';

@Entity({ tableName: 'cart_item' })
export class CartItemEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @ManyToOne(() => ProductVariantEntity)
  productVariant!: Rel<ProductVariantEntity>;

  @Property({ type: 'int' })
  quantity: number;

  @ManyToOne(() => CartEntity)
  cart!: Rel<CartEntity>;
}
