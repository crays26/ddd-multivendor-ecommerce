import { Expose, Type } from 'class-transformer';

export class ProductDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  @Type(() => CategoryResponseDto)
  category: CategoryResponseDto;

  @Expose()
  @Type(() => VendorResponseDto)
  vendor: VendorResponseDto;

  @Expose()
  description: string;

  @Expose()
  @Type(() => VariantResponseDto)
  variants: VariantResponseDto[];

  @Expose()
  @Type(() => AttributeResponseDto)
  attributes: AttributeResponseDto[];
}

export class VariantResponseDto {
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
  @Type(() => VariantAttributeResponseDto)
  associatedAttributes: VariantAttributeResponseDto[];
}

export class VariantAttributeResponseDto {
  @Expose()
  key: string;

  @Expose()
  value: string;
}

export class AttributeResponseDto {
  @Expose()
  key: string;

  @Expose()
  values: string[];
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

class CategoryResponseDto {
    @Expose()
    id: string;

    @Expose()
    name: string;
}
