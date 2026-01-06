import { DomainEntityBase } from 'src/shared/ddd/domain/base/domain-entity.base';
import { v7 as uuidV7 } from 'uuid';
import { VariantAssociatedAttributeVO } from '../value-objects/variant-associated-attribute.vo';

interface ProductVariantProps {
  id: string;
  name: string;
  stock: number;
  skuCode: string;
  price: number;
  isBase: boolean;
  associatedAttributes: VariantAssociatedAttributeVO[];
}

interface CreateProductVariantProps {
  id?: string;
  name: string;
  stock: number;
  skuCode: string;
  price: number;
  isBase?: boolean;
  associatedAttributes: VariantAssociatedAttributeVO[];
}

export class ProductVariant extends DomainEntityBase<string, ProductVariantProps> {
  private constructor(props: ProductVariantProps) {
    super(props);
  }

  public static create(props: CreateProductVariantProps) {
    return new ProductVariant({
      ...props,
      id: props.id ?? uuidV7(),
      isBase: props.isBase ?? false,
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

  public isBase(): boolean {
    return this.props.isBase;
  }
}
