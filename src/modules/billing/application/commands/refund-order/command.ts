import { Command } from '@nestjs/cqrs';

interface Order {
  orderId: string;
  vendorId: string;
  subtotal: number;
}
export class RefundOrderCommand extends Command<void> {
  constructor(
    public readonly payload: {
      checkoutId: string;
      transactionId: string;
      orders: Order[];
      customerId: string;
      totalAmount: number;
    },
  ) {
    super();
  }
}
