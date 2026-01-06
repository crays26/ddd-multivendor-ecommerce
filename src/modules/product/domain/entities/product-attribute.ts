import { DomainEntityBase } from 'src/shared/ddd/domain/base/domain-entity.base';
import { v7 as uuidV7 } from 'uuid';
import { BadRequestException } from '@nestjs/common';
interface ProductAttributeProps {
  id: string;
  key: string;
  values: string[];
}

interface CreateProductAttributeProps {
  id?: string;
  key: string;
  values: string[];

}

export class ProductAttribute extends DomainEntityBase<string, ProductAttributeProps> {
  private constructor(props: ProductAttributeProps) {
    super(props);
    this.validate(props);
  }

  private validate(props: ProductAttributeProps): void {
    if (!props.key || !props.values.length) {
      throw new BadRequestException('Invalid attribute key or values');
    }
    const valueSet = new Set(props.values);
    if (valueSet.size !== props.values.length) {
      throw new BadRequestException('Duplicate attribute values found');
    }
  }

  public static create(props: CreateProductAttributeProps) {
    return new ProductAttribute({ ...props, id: props.id ?? uuidV7() });
  }

  public getId(): string {
    return this.props.id;
  }

  public getKey(): string {
    return this.props.key;
  }

  public getValues(): string[] {
    return this.props.values;
  }
}
