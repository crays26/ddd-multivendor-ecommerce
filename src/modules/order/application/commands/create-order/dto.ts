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
}
export class CreateOrderDto {
  @ValidateNested({ each: true })
  @Type(() => CreateLineItemDto)
  @ArrayMinSize(1)
  lineItems: CreateLineItemDto[];

  @IsNotEmpty()
  @IsUUID()
  vendorId: string;
}
