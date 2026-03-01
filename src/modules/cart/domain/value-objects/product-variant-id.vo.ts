import { ValueObjectBase } from 'src/shared/ddd/domain/base/value-object.base';

interface ProductVariantIdProps {
  id: string;
}

export class ProductVariantIdVO extends ValueObjectBase<ProductVariantIdProps> {
  private constructor(props: ProductVariantIdProps) {
    super(props);
  }

  public static create(props: ProductVariantIdProps): ProductVariantIdVO {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error('Product Variant ID cannot be empty');
    }
    return new ProductVariantIdVO(props);
  }

  public getId(): string {
    return this.props.id;
  }
}
