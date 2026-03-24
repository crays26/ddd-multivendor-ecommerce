import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class AddItemToCartDto {
  @IsString()
  @IsNotEmpty()
  productVariantId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;
}
