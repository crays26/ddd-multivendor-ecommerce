import { BaseEntity } from 'src/shared/ddd/domain/base/BaseEntity';
import { randomUUID, UUID } from 'crypto';

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

export class ProductAttribute extends BaseEntity<string, ProductAttributeProps> {
  private constructor(props: ProductAttributeProps) {
    super(props);
  }

  public static create(props: CreateProductAttributeProps) {
    return new ProductAttribute({ ...props, id: props.id ?? randomUUID() });
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
