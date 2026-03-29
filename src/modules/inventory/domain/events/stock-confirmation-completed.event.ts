import { IEvent } from '@nestjs/cqrs';

interface SucceededOrder {
  orderId: string;
  vendorId: string;
  subtotal: number;
}
export class StockConfirmationSucceededEvent implements IEvent {
  constructor(
    public readonly payload: {
      checkoutId: string;
      transactionId: string;
      customerId: string;
      totalAmount: number;
      orders: SucceededOrder[];
    },
  ) {}
}
