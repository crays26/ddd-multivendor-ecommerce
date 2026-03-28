import { Expose, Type } from 'class-transformer';

class CategoryDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

class VendorResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  rating: number;
}

class VariantAttributeResponseDto {
  @Expose()
  key: string;

  @Expose()
  value: string;
}

class AttributeResponseDto {
  @Expose()
  key: string;

  @Expose()
  values: string[];
}

class VariantResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  skuCode: string;

  @Expose()
  stock: number;

  @Expose()
  price: number;

  @Expose()
  isBase: boolean;

  @Expose()
  @Type(() => VariantAttributeResponseDto)
  associatedAttributes: VariantAttributeResponseDto[];
}

export class GetProductBySlugDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  @Type(() => VariantResponseDto)
  variants: VariantResponseDto[];

  @Expose()
  @Type(() => AttributeResponseDto)
  attributes: AttributeResponseDto[];

  @Expose()
  @Type(() => VendorResponseDto)
  vendor!: VendorResponseDto;

  @Expose()
  @Type(() => CategoryDto)
  category!: CategoryDto;
}
