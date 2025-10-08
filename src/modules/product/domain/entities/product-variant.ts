import { BaseEntity } from 'src/shared/ddd/domain/base/BaseEntity';
import { v7 as uuidV7 } from 'uuid';
import { VariantAssociatedAttributeVO } from '../value-objects/variant-associated-attribute.vo';

interface ProductVariantProps {
  id: string;
  name: string;
  stock: number;
  skuCode: string;
  price: number;
  associatedAttributes: VariantAssociatedAttributeVO[];
}

interface CreateProductVariantProps {
  id?: string;
  name: string;
  stock: number;
  skuCode: string;
  price: number;
  associatedAttributes: VariantAssociatedAttributeVO[];
}

export class ProductVariant extends BaseEntity<string, ProductVariantProps> {
  private constructor(props: ProductVariantProps) {
    super(props);
  }

  public static create(props: CreateProductVariantProps) {
    return new ProductVariant({
      ...props,
      id: props.id ?? uuidV7(),
      associatedAttributes: props.associatedAttributes ?? [],
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

  public getAssociatedAttributes(): { key: string; value: string }[] {
    return this.props.associatedAttributes.map((a) => ({
      key: a.getKey(),
      value: a.getValue(),
    }));
  }
}
