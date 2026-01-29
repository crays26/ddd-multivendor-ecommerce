import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RestockCommand } from './command';
import {
  IInventoryRepository,
  INVENTORY_REPO,
} from '../../../domain/repositories/inventory.repo.interface';

@CommandHandler(RestockCommand)
export class RestockCommandHandler implements ICommandHandler<RestockCommand> {
  constructor(
    @Inject(INVENTORY_REPO)
    private readonly inventoryRepo: IInventoryRepository,
  ) {}

  async execute(command: RestockCommand): Promise<void> {
    const { variantId, quantity } = command.payload;
    await this.inventoryRepo.restock(variantId, quantity);
  }
}
