import { Command } from '@nestjs/cqrs';

interface ConfirmReservationItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

interface ConfirmReservationOrder {
  orderId: string;
  vendorId: string;
  items: ConfirmReservationItem[];
  subtotal: number;
}

export class ConfirmReservationCommand extends Command<void> {
  constructor(
    public readonly payload: {
      orders: ConfirmReservationOrder[];
      checkoutId: string;
      transactionId: string;
      customerId: string;
      totalAmount: number;
    },
  ) {
    super();
  }
}
