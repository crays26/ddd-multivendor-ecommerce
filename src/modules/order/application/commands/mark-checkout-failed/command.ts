import { Command } from '@nestjs/cqrs';

export class MarkCheckoutFailedCommand extends Command<void> {
  constructor(public readonly checkoutId: string) {
    super();
  }
}
