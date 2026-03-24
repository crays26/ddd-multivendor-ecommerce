import { Command, ICommand } from '@nestjs/cqrs';

export class AddItemToCartCommand extends Command<void> {
  constructor(
    public readonly payload: {
      productVariantId: string;
      quantity: number;
      customerId: string;
    },
  ) {
    super();
  }
}
