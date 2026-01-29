import { Command } from '@nestjs/cqrs';

export class CreateInventoryCommand extends Command<string> {
  constructor(
    public readonly variantId: string,
    public readonly quantity: number,
  ) {
    super();
  }
}
