import { ValueObjectBase } from 'src/shared/ddd/domain/base/value-object.base';
import { BadRequestException } from '@nestjs/common';

interface CustomerIdProps {
    id: string;
}

export class CustomerIdVO extends ValueObjectBase<CustomerIdProps> {
    private constructor(props: CustomerIdProps) {
        super(props);
    }

    static create(props: CustomerIdProps): CustomerIdVO {
        if (!props.id) {
            throw new BadRequestException('CustomerId cannot be empty');
        }
        return new CustomerIdVO(props);
    }

    public getId(): string {
        return this.props.id;
    }
}