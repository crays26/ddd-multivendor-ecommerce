import { Command } from '@nestjs/cqrs';

enum OrderResultStatus {
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}
interface OrderResult {
  orderId: string;
  status: OrderResultStatus;
}
export class UpdateOrdersStatusFromStockCommand extends Command<void> {
  constructor(
    public readonly payload: {
      checkoutId: string;
      orderResults: OrderResult[];
    },
  ) {
    super();
  }
}
