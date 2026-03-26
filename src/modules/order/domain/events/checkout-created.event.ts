import { IEvent } from '@nestjs/cqrs';

interface CheckoutEventItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

interface CheckoutEventOrder {
  orderId: string;
  vendorId: string;
  items: CheckoutEventItem[];
  subtotal: number;
}

export class CheckoutCreatedEvent implements IEvent {
  constructor(
    public readonly payload: {
      checkoutId: string;
      customerId: string;
      orders: CheckoutEventOrder[];
      totalAmount: number;
    },
  ) {}
}
