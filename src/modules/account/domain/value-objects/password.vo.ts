import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BaseValueObject } from 'src/shared/ddd/domain/base/BaseValueObject';

const SALT_ROUND = 10;

export class PasswordVO extends BaseValueObject {

  private constructor(private value: string) {
    super(value);
    if (!this.validate(value)) {
      throw new BadRequestException(
        'Password must be at least 8 characters and contain at least 1 uppercase letter'
      );
    }
    
  }

  static create(value: string): PasswordVO {
    return new PasswordVO(value);
  }

  getValue(): string {
    return this.value;
  }

  hash(): void {
    this.value = bcrypt.hashSync(this.value, SALT_ROUND);
  }

  private validate(value: string): boolean {
    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    return hasMinLength && hasUppercase;
  }
}
