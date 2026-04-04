import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class GuestCartItemSummaryDto {
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
  @IsBoolean()
  isOutOfStock: boolean;

  @Expose()
  @IsNumber()
  @Min(0)
  lineTotal: number;
}

export class GuestCartVendorDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  name: string;
}

export class GuestCartPerVendorSummaryDto {
  @Expose()
  @ValidateNested()
  @Type(() => GuestCartVendorDto)
  vendor: GuestCartVendorDto;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => GuestCartItemSummaryDto)
  items: GuestCartItemSummaryDto[];

  @Expose()
  @IsNumber()
  subtotal: number;
}

export class GuestCartSummaryDto {
  @Expose()
  @IsUUID()
  cartId: string;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => GuestCartPerVendorSummaryDto)
  vendors: GuestCartPerVendorSummaryDto[];

  @Expose()
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @Expose()
  @IsInt()
  @Min(0)
  itemCount: number;
}
