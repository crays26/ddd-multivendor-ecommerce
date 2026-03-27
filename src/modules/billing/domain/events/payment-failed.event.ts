import { IEvent } from '@nestjs/cqrs';

interface CheckoutEventOrder {
  orderId: string;
  vendorId: string;
  items: CheckoutEventItem[];
  subtotal: number;
}

interface CheckoutEventItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

export class PaymentFailedEvent implements IEvent {
  constructor(
    public readonly checkoutId: string,
    public readonly transactionId: string,
    public readonly reason: string,
    public readonly orders: CheckoutEventOrder[],
  ) {}
}
