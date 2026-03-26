import { IEvent } from '@nestjs/cqrs';

interface ProductAttributeEvent {
  id: string;
  key: string;
  values: string[];
}

interface ProductVariantEvent {
  id: string;
  name: string;
  skuCode: string;
  stock: number;
  price: number;
  isBase: boolean;
  associatedAttributes: {
    key: string;
    value: string;
  }[];
}

export class ProductCreatedEvent implements IEvent {
  constructor(
    public readonly id: string,
    public readonly vendorId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly categoryId: string,
    public readonly variants: ProductVariantEvent[],
    public readonly attributes: ProductAttributeEvent[],
  ) {}
}
