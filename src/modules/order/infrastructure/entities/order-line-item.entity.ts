import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { ProductVariantEntity } from 'src/modules/product/infrastructure/entities/product-variant.entity';
import { OrderEntity } from 'src/modules/order/infrastructure/entities/order.entity';

@Entity({ tableName: 'order_line_item' })
export class OrderLineItemEntity {
  @PrimaryKey({ type: 'uuid' })
  id!: string;

  @Property({ type: 'int' })
  price!: number;

  @Property()
  quantity!: number;

  @ManyToOne(() => OrderEntity)
  order: OrderEntity;

  @ManyToOne(() => ProductVariantEntity)
  productVariant: ProductVariantEntity;
}
