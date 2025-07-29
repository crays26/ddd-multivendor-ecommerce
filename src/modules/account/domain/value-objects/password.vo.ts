import { BadRequestException } from '@nestjs/common';

export class PasswordVO {

  private constructor(private readonly value: string) {
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

  private validate(value: string): boolean {
    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    return hasMinLength && hasUppercase;
  }
}
