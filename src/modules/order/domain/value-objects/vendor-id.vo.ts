import { ValueObjectBase } from 'src/shared/ddd/domain/base/value-object.base';
import { BadRequestException } from '@nestjs/common';

interface VendorIdProps {
    id: string;
}

export class VendorIdVO extends ValueObjectBase<VendorIdProps> {
    private constructor(props: VendorIdProps) {
        super(props);
    }

    static create(props: VendorIdProps): VendorIdVO {
        if (!props.id) {
            throw new BadRequestException('VendorId cannot be empty');
        }
        return new VendorIdVO(props);
    }

    public getId(): string {
        return this.props.id;
    }
}