import { IEvent } from '@nestjs/cqrs';

export interface CheckoutEventItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface CheckoutEventOrder {
  orderId: string;
  vendorId: string;
  items: CheckoutEventItem[];
  subtotal: number;
}

export class CheckoutCreatedEvent implements IEvent {
  constructor(
    public readonly checkoutId: string,
    public readonly customerId: string,
    public readonly orders: CheckoutEventOrder[],
    public readonly totalAmount: number,
  ) {}
}
