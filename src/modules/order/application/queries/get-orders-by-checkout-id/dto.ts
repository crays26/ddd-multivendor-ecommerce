import {
  IsUUID,
  IsInt,
  IsPositive,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

class OrderItemDto {
  @Expose()
  variantId: string;

  @Expose()
  quantity: number;

  @Expose()
  priceAtPurchase: number;
}

export class OrdersByCheckoutIdDto {
  @Expose()
  orderId: string;

  @Expose()
  vendorId: string;

  @Type(() => OrderItemDto)
  @Expose()
  items: OrderItemDto[];

  @Expose()
  subtotal: number;
}
