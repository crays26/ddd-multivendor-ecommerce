import { BaseEntity } from 'src/shared/domain/base/BaseEntity';
import { randomUUID, UUID } from 'crypto';

interface ProductSKUProps {
  id: UUID;
  name: string;
  stock: number;
  skuCode: string;
  price: number;
}

interface CreateProductSKUProps {
  id: UUID;
  name: string;
  stock: number;
  skuCode: string;
  price: number;
}

export class ProductSKU extends BaseEntity<UUID, ProductSKUProps> {
  private constructor(props: ProductSKUProps) {
    super(props);
  }

  public static create(props: CreateProductSKUProps) {
    return new ProductSKU({ ...props, id: randomUUID() });
  }

  public getId() {
    return this.props.id;
  }
}
