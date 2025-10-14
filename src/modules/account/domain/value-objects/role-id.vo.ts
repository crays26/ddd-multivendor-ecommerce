import {BaseValueObject} from "src/shared/ddd/domain/base/BaseValueObject";
interface RoleIdProps {
    id: string
}
export class RoleIdVO extends BaseValueObject<RoleIdProps> {
    private constructor(props: RoleIdProps) {
        super(props);
    }

    static create(props: RoleIdProps): RoleIdVO {
        return new RoleIdVO(props);
    }

    public getId(): string {
        return this.props.id;
    }
}