import { randomUUID, UUID } from 'crypto';
import { BaseAggregateRoot } from 'src/shared/domain/base/BaseAggregateRoot';

interface ProductProps {
  id: UUID;
  name: string;
  slug: string;
  description: string;
  vendorId: UUID;
  categoryId: UUID;
}

interface CreateProductProps {
  name: string;
  description: string;
  categoryId: UUID;
  vendorId: UUID;
}

export class Product extends BaseAggregateRoot<UUID, ProductProps> {
  private constructor(props: ProductProps) {
    super(props);
  }

  static create(props: CreateProductProps): Product {
    const product = new Product({
      ...props,
      id: randomUUID(),
      slug: 'slugify name example',
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
}


