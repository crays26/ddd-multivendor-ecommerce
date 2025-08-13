export class VariantAttributeValueVO {
  private constructor(
    private readonly key: string,
    private readonly value: string,
  ) {}

  static create(key: string, value: string): VariantAttributeValueVO {
    return new VariantAttributeValueVO(key, value);
  }

  getKey(): string {
    return this.key;
  }
  getValue(): string {
    return this.value;
  }
}
