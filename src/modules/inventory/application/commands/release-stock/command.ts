import { Command } from '@nestjs/cqrs';

export class ReleaseStockCommand extends Command<void> {
  constructor(
    public readonly payload: {
      variantId: string;
      quantity: number;
    },
  ) {
    super();
  }
}
