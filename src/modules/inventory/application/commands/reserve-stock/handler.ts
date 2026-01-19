import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReserveStockCommand } from './command';
import { InventoryRepository } from '../../../infrastructure/repositories/inventory.repo';
import { INVENTORY_REPO } from '../../../domain/repositories/inventory.repo.interface';

@CommandHandler(ReserveStockCommand)
export class ReserveStockCommandHandler
  implements ICommandHandler<ReserveStockCommand>
{
  constructor(
    @Inject(INVENTORY_REPO)
    private readonly inventoryRepo: InventoryRepository,
  ) {}

  async execute(command: ReserveStockCommand): Promise<void> {
    const { variantId, quantity } = command.payload;
    await this.inventoryRepo.reserveStock(variantId, quantity);
  }
}
