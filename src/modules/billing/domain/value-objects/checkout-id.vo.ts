import { ValueObjectBase } from 'src/shared/ddd/domain/base/value-object.base';

interface CheckoutIdProps {
  id: string;
}

export class CheckoutIdVO extends ValueObjectBase<CheckoutIdProps> {
  private constructor(props: CheckoutIdProps) {
    super(props);
  }

  static create(props: CheckoutIdProps): CheckoutIdVO {
    return new CheckoutIdVO(props);
  }

  public getId(): string {
    return this.props.id;
  }
}
