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

interface ProductEvent {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  categoryId: string;
  variants: ProductVariantEvent[];
  attributes: ProductAttributeEvent[];
}
export class ProductCreatedEvent implements IEvent {
  constructor(public readonly props: ProductEvent) {}
}
