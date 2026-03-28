import { Command } from '@nestjs/cqrs';

export class ProcessPaymentSuccessCommand extends Command<void> {
  constructor(public readonly paymentIntentId: string) {
    super();
  }
}
