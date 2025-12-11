import { ValueObjectBase } from 'src/shared/ddd/domain/base/value-object.base';
import { BadRequestException } from '@nestjs/common';

interface ProductVariantIdProps {
    id: string;
}

export class ProductVariantIdVO extends ValueObjectBase<ProductVariantIdProps> {
    private constructor(props: ProductVariantIdProps) {
        super(props);
    }

    static create(props: ProductVariantIdProps): ProductVariantIdVO {
        if (!props.id) {
            throw new BadRequestException('ProductSkuId cannot be empty');
        }
        return new ProductVariantIdVO(props);
    }

    public getId(): string {
        return this.props.id;
    }
}