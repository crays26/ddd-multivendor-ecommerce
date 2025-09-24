import { BadRequestException } from "@nestjs/common";
import { BaseValueObject } from "src/shared/ddd/domain/base/BaseValueObject";

interface EmailProps {
  value: string;
}

export class EmailVO extends BaseValueObject<EmailProps> {
    
  private constructor(props: EmailProps) {
    // if (!this.validate(value)) {
    //   throw new BadRequestException('Invalid email format');
    // }
    super(props)
  }

  static create(props: EmailProps): EmailVO {
    return new EmailVO(props);
  }

  getValue(): string {
    return this.props.value;
  }

  private validate(value: string): boolean {
    
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
