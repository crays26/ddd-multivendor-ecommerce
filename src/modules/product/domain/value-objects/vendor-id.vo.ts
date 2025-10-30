import {ValueObjectBase} from "src/shared/ddd/domain/base/value-object.base";

interface VendorIdProps {
    id: string;
}

export class VendorIdVO extends ValueObjectBase<VendorIdProps> {
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