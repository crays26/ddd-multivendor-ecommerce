import { BadRequestException } from "@nestjs/common";

export class EmailVO {
    
  private constructor(private readonly value: string) {
    if (!this.validate(value)) {
      throw new BadRequestException('Invalid email format');
    }
  }

  static create(value: string): EmailVO {
    return new EmailVO(value);
  }

  getValue(): string {
    return this.value;
  }

  private validate(value: string): boolean {
    
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
