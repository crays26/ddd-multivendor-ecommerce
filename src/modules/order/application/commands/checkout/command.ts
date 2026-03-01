import { Command } from '@nestjs/cqrs';
import { CheckoutDto } from './dto';

export class CheckoutCommand extends Command<string> {
  constructor(
    public readonly payload: {
      customerId: string;
      checkoutData: CheckoutDto;
    },
  ) {
    super();
  }
}
