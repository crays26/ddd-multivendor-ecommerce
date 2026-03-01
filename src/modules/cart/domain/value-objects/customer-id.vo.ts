import { ValueObjectBase } from 'src/shared/ddd/domain/base/value-object.base';

interface CustomerIdProps {
  id: string;
}

export class CustomerIdVO extends ValueObjectBase<CustomerIdProps> {
  private constructor(props: CustomerIdProps) {
    super(props);
  }

  public static create(props: CustomerIdProps): CustomerIdVO {
    if (!props.id || props.id.trim().length === 0) {
      throw new Error('Customer ID cannot be empty');
    }
    return new CustomerIdVO(props);
  }

  public getId(): string {
    return this.props.id;
  }
}
