import { BaseValueObject } from "src/shared/ddd/domain/base/BaseValueObject";

interface AccountIdProps {
    id: string
}
export class AccountId extends BaseValueObject<AccountIdProps> {
    private constructor(props: AccountIdProps) {
        super(props);
    }

    static create(props: AccountIdProps): AccountId {
        return new AccountId(props);
    }

    public getId(): string {
        return this.props.id;
    }
}