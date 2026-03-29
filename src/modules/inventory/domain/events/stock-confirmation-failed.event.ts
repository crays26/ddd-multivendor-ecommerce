import { IEvent } from '@nestjs/cqrs';

interface FailedOrder {
  orderId: string;
  vendorId: string;
  subtotal: number;
}
export class StockConfirmationFailedEvent implements IEvent {
  constructor(
    public readonly payload: {
      checkoutId: string;
      transactionId: string;
      customerId: string;
      totalAmount: number;
      orders: FailedOrder[];
    },
  ) {}
}
