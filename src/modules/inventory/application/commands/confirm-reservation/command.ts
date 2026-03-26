import { Command } from '@nestjs/cqrs';

export interface ConfirmReservationItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

export class ConfirmReservationCommand extends Command<void> {
  constructor(
    public readonly payload: {
      orderId: string;
      vendorId: string;
      checkoutId: string;
      transactionId: string;
      items: ConfirmReservationItem[];
      amount: number;
    },
  ) {
    super();
  }
}
