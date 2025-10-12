import { Expose, Type } from 'class-transformer';

export class CategoryDto {
    @Expose()
    id: string;

    @Expose()
    name: string;
}

export class VendorResponseDto {
    @Expose()
    id: string;

    @Expose()
    name: string;

    @Expose()
    description: string;

    @Expose()
    rating: number;
}

export class ProductDto {
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


