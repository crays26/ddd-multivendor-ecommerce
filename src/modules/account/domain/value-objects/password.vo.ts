import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ValueObjectBase } from 'src/shared/ddd/domain/base/value-object.base';

const SALT_ROUND = 10;

interface PasswordProps {
  value: string;
}

export class PasswordVO extends ValueObjectBase<PasswordProps> {
  private constructor(props: PasswordProps) {
    super(props);
    if (!this.validate(props.value)) {
      throw new BadRequestException(
        'Password must be at least 8 characters and contain at least 1 uppercase letter',
      );
    }
  }

  static create(props: PasswordProps): PasswordVO {
    return new PasswordVO(props);
  }

  getValue(): string {
    return this.props.value;
  }

  hash(): void {
    this.props.value = bcrypt.hashSync(this.props.value, SALT_ROUND);
  }

  private validate(value: string): boolean {
    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    return hasMinLength && hasUppercase;
  }
}
