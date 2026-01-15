import { ValueObjectBase } from 'src/shared/ddd/domain/base/value-object.base';

interface VariantIdProps {
  id: string;
}

export class VariantIdVO extends ValueObjectBase<VariantIdProps> {
  private constructor(props: VariantIdProps) {
    super(props);
  }

  static create(props: VariantIdProps): VariantIdVO {
    return new VariantIdVO(props);
  }

  public getId(): string {
    return this.props.id;
  }
}
