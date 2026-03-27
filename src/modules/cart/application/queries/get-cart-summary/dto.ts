import { Expose, Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CartItemSummaryDto {
  @Expose()
  @IsUUID()
  variantId: string;

  @Expose()
  @IsString()
  variantName: string;

  @Expose()
  @IsString()
  skuCode: string;

  @Expose()
  @IsNumber()
  @Min(0)
  price: number;

  @Expose()
  @IsInt()
  @Min(1)
  quantity: number;

  @Expose()
  @IsNumber()
  @Min(0)
  lineTotal: number;
}

export class CartVendorDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  name: string;
}

export class CartPerVendorSummaryDto {
  @Expose()
  @ValidateNested()
  @Type(() => CartVendorDto)
  vendor: CartVendorDto;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => CartItemSummaryDto)
  items: CartItemSummaryDto[];

  @Expose()
  @IsNumber()
  totalAmount: number;
}

export class CartSummaryDto {
  @Expose()
  @IsUUID()
  cartId: string;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => CartPerVendorSummaryDto)
  vendors: CartPerVendorSummaryDto[];

  @Expose()
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @Expose()
  @IsInt()
  @Min(0)
  itemCount: number;
}
