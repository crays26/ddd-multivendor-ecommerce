import { Command } from '@nestjs/cqrs';

interface CreateInventoryVariant {
  productVariantId: string;
  quantity: number;
}

export class CreateInventoryCommand extends Command<void> {
  constructor(
    public readonly variants: CreateInventoryVariant[],
  ) {
    super();
  }
}
