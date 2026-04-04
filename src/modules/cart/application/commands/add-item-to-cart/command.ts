import { Command } from '@nestjs/cqrs';

export class AddItemToCartCommand extends Command<void | string> {
  constructor(
    public readonly payload: {
      productVariantId: string;
      quantity: number;
      customerId?: string;
      guestCartSessionId?: string;
    },
  ) {
    super();
  }
}
