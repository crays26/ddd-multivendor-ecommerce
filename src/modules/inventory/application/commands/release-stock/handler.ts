import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReleaseStockCommand } from './command';
import {
  IInventoryRepository,
  INVENTORY_REPO,
} from '../../../domain/repositories/inventory.repo.interface';

@CommandHandler(ReleaseStockCommand)
export class ReleaseStockCommandHandler
  implements ICommandHandler<ReleaseStockCommand>
{
  constructor(
    @Inject(INVENTORY_REPO)
    private readonly inventoryRepo: IInventoryRepository,
  ) {}

  async execute(command: ReleaseStockCommand): Promise<void> {
    const { variantId, quantity } = command.payload;
    await this.inventoryRepo.releaseStock(variantId, quantity);
  }
}
