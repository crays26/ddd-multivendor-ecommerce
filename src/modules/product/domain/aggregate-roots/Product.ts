import { randomUUID, UUID } from 'crypto';
import { BaseAggregateRoot } from 'src/shared/domain/base/BaseAggregateRoot';
import { ProductVariant } from '../entities/ProductVariant';
import { ProductAttribute } from '../entities/ProductAttribute';

interface ProductProps {
  id: UUID;
  name: string;
  slug: string;
  description: string;
  vendorId: UUID;
  categoryId: UUID;
  variants: ProductVariant[];
  attributes: ProductAttribute[];
}

interface CreateProductProps {
  name: string;
  description: string;
  categoryId: UUID;
  vendorId: UUID;
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
}

export class ProductAggRoot extends BaseAggregateRoot<UUID, ProductProps> {
  private constructor(props: ProductProps) {
    super(props);
  }

  static create(props: CreateProductProps): ProductAggRoot {
    const product = new ProductAggRoot({
      ...props,
      id: randomUUID(),
      slug: 'slugify name example',
      variants: props.variants ?? [],
      attributes: props.attributes ?? [],
    });
    // product.addEvent(new ProductCreatedEvent(props.id));
    return product;
  }

  public updateDescription(newDescription: string) {
    if (!newDescription || newDescription.length < 10) {
      throw new Error('Description too short');
    }

    this.props.description = newDescription;
    // this.apply(new ProductDescriptionUpdatedEvent(this.id, newDescription));
  }

  public getId(): string {
    return this.props.id;
  }

  public getSlug(): string {
    return this.props.slug;
  }

  public getName(): string {
    return this.props.name;
  }

  public getCategoryId(): UUID {
    return this.props.categoryId;
  }

  public getDescription(): string {
    return this.props.description;
  }

  public getVariants(): ProductVariant[] {
    return this.props.variants;
  }

  public getAttributes(): ProductAttribute[] {
    return this.props.attributes;
  }
}


