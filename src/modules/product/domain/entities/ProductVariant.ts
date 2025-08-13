import { BaseEntity } from 'src/shared/domain/base/BaseEntity';
import { randomUUID, UUID } from 'crypto';
import { VariantAttributeValueVO } from '../value-objects/VariantAttributeValue';

interface ProductVariantProps {
  id: string;
  name: string;
  stock: number;
  skuCode: string;
  price: number;
  attributes: VariantAttributeValueVO[];
}

interface CreateProductVariantProps {
  id: string;
  name: string;
  stock: number;
  skuCode: string;
  price: number;
  attributes: VariantAttributeValueVO[];
}

export class ProductVariant extends BaseEntity<string, ProductVariantProps> {
  private constructor(props: ProductVariantProps) {
    super(props);
  }

  public static create(props: CreateProductVariantProps) {
    return new ProductVariant({
      ...props,
      id: randomUUID(),
      attributes: props.attributes ?? [],
    });
  }

  public getId(): string {
    return this.props.id;
  }

  public getName(): string {
    return this.props.name;
  }

  public getSkuCode(): string {
    return this.props.skuCode;
  }

  public getStock(): number {
    return this.props.stock;
  }

  public getPrice(): number {
    return this.props.price;
  }

  public getAttributes(): { key: string; value: string }[] {
    return this.props.attributes.map((a) => ({
      key: a.getKey(),
      value: a.getValue(),
    }));
  }
}
