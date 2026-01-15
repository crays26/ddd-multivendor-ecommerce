import { ValueObjectBase } from 'src/shared/ddd/domain/base/value-object.base';

interface OrderGroupIdProps {
  id: string;
}

export class OrderGroupIdVO extends ValueObjectBase<OrderGroupIdProps> {
  private constructor(props: OrderGroupIdProps) {
    super(props);
  }

  static create(props: OrderGroupIdProps): OrderGroupIdVO {
    return new OrderGroupIdVO(props);
  }

  public getId(): string {
    return this.props.id;
  }
}
