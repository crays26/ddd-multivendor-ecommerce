import {BaseValueObject} from "src/shared/ddd/domain/base/BaseValueObject";

interface VendorIdProps {
    id: string;
}

export class VendorIdVO extends BaseValueObject<VendorIdProps> {
    private constructor(props: VendorIdProps) {
        super(props);
    }

    static create(props: VendorIdProps): VendorIdVO {
        return new VendorIdVO(props);
    }

    public getId(): string {
        return this.props.id;
    }
}