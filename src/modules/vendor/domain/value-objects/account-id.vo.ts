import { ValueObjectBase } from 'src/shared/ddd/domain/base/value-object.base';

interface AccountIdProps {
  id: string;
}
export class AccountIdVO extends ValueObjectBase<AccountIdProps> {
  private constructor(props: AccountIdProps) {
    super(props);
  }

  static create(props: AccountIdProps): AccountIdVO {
    return new AccountIdVO(props);
  }

  public getId(): string {
    return this.props.id;
  }
}
