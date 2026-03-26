import { ValueObjectBase } from 'src/shared/ddd/domain/base/value-object.base';

interface ProductVariantIdProps {
  id: string;
}

export class ProductVariantIdVO extends ValueObjectBase<ProductVariantIdProps> {
  private constructor(props: ProductVariantIdProps) {
    super(props);
  }

  static create(props: ProductVariantIdProps): ProductVariantIdVO {
    return new ProductVariantIdVO(props);
  }

  public getId(): string {
    return this.props.id;
  }
}
