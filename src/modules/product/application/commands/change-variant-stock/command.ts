import { Command } from '@nestjs/cqrs';

export class ChangeVariantStockCommand extends Command<string> {
  constructor(
    public readonly payload: {
      productVariantId: string;
      deltaStock: number;
    },
  ) {
    super();
  }
}
