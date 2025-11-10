import { ValueObjectBase } from 'src/shared/ddd/domain/base/value-object.base';
import { BadRequestException } from '@nestjs/common';

interface ProductVariantIdProps {
    id: string;
}

export class ProductVariantIdVO extends ValueObjectBase<ProductVariantIdProps> {
    private constructor(props: ProductVariantIdProps) {
        super(props);
    }

    static create(id: string): ProductVariantIdVO {
        if (!id) {
            throw new BadRequestException('ProductSkuId cannot be empty');
        }
        return new ProductVariantIdVO({ id });
    }

    public getId(): string {
        return this.props.id;
    }
}