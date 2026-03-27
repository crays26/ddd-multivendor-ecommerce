import { ValueObjectBase } from 'src/shared/ddd/domain/base/value-object.base';

interface OrderIdProps {
  id: string;
}

export class OrderIdVO extends ValueObjectBase<OrderIdProps> {
  private constructor(props: OrderIdProps) {
    super(props);
  }

  static create(props: OrderIdProps): OrderIdVO {
    return new OrderIdVO(props);
  }

  public getId(): string {
    return this.props.id;
  }
}
