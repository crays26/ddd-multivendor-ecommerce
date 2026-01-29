import { Command } from '@nestjs/cqrs';

export class RestockCommand extends Command<void> {
  constructor(
    public readonly payload: {
      variantId: string;
      quantity: number;
    },
  ) {
    super();
  }
}
