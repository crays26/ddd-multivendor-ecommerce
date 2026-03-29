import { IEvent } from '@nestjs/cqrs';

interface CheckoutStockReservationCompletedItem {
  variantId: string;
  quantity: number;
}

interface CheckoutStockReservationCompletedOrder {
  orderId: string;
  vendorId: string;
  items: CheckoutStockReservationCompletedItem[];
  subtotal: number;
}

export class CheckoutStockReservationCompletedEvent implements IEvent {
  constructor(
    public readonly payload: {
      checkoutId: string;
      customerId: string;
      orders: CheckoutStockReservationCompletedOrder[];
      totalAmount: number;
    },
  ) {}
}
