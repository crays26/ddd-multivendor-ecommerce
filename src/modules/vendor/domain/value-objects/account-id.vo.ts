import { BaseValueObject } from "src/shared/ddd/domain/base/BaseValueObject";

interface AccountIdProps {
    id: string
}
export class AccountIdVO extends BaseValueObject<AccountIdProps> {
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