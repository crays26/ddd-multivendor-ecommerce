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

export class PaymentSucceededEvent implements IEvent {
  constructor(
    public readonly payload: {
      checkoutId: string;
      transactionId: string;
      orders: CheckoutEventOrder[];
      customerId: string;
      totalAmount: number;
    },
  ) {}
}
