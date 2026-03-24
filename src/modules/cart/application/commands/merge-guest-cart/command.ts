import { Command } from '@nestjs/cqrs';

export class MergeGuestCartCommand extends Command<void> {
  constructor(
    public readonly payload: {
      customerId: string;
      items: {
        productVariantId: string;
        quantity: number;
      }[];
    },
  ) {
    super();
  }
}
