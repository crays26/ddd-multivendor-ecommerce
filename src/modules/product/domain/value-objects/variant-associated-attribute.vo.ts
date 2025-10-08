import { BaseValueObject } from 'src/shared/ddd/domain/base/BaseValueObject';

export interface VariantAssociatedAttributeProps {
  key: string;
  value: string;
}

export class VariantAssociatedAttributeVO extends BaseValueObject<VariantAssociatedAttributeProps> {
  private constructor(props: VariantAssociatedAttributeProps) {
    super(props);
  }

  static create(
    props: VariantAssociatedAttributeProps,
  ): VariantAssociatedAttributeVO {
    return new VariantAssociatedAttributeVO(props);
  }

  getKey(): string {
    return this.props.key;
  }
  getValue(): string {
    return this.props.value;
  }
}
