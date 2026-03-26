import { Command } from '@nestjs/cqrs';
import { CheckoutStatus } from 'src/modules/order/domain/aggregate-roots/checkout.agg-root';

export class UpdateCheckoutStatusCommand extends Command<void> {
  constructor(
    public readonly checkoutId: string,
    public readonly status: CheckoutStatus,
  ) {
    super();
  }
}
