import {
  IsInt,
  IsNotEmpty,
  IsUUID,
  Min,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLineItemDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @IsNotEmpty()
  @IsUUID()
  productVariantId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  expectedPrice: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsUUID()
  vendorId: string;

  @ValidateNested({ each: true })
  @Type(() => CreateLineItemDto)
  @ArrayMinSize(1)
  lineItems: CreateLineItemDto[];
}

export class CheckoutDto {
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDto)
  @ArrayMinSize(1)
  orders: CreateOrderDto[];

  @IsNotEmpty()
  @IsUUID()
  idempotencyKey: string;
}
