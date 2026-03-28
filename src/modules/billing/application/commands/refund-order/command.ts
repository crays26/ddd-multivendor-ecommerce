import { Command } from '@nestjs/cqrs';

export class RefundOrderCommand extends Command<void> {
  constructor(
    public readonly payload: {
      orderId: string;
      vendorId: string;
      transactionId: string;
      amount: number;
      reason: string;
    },
  ) {
    super();
  }
}
