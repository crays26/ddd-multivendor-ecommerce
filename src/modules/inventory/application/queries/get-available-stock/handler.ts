import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAvailableStockQuery } from './query';
import { InventoryRepository } from '../../../infrastructure/repositories/inventory.repo';
import { INVENTORY_REPO } from '../../../domain/repositories/inventory.repo.interface';

@QueryHandler(GetAvailableStockQuery)
export class GetAvailableStockQueryHandler
  implements IQueryHandler<GetAvailableStockQuery>
{
  constructor(
    @Inject(INVENTORY_REPO)
    private readonly inventoryRepo: InventoryRepository,
  ) {}

  async execute(query: GetAvailableStockQuery): Promise<number> {
    const inventory = await this.inventoryRepo.findByVariantId(query.variantId);
    if (!inventory) {
      return 0;
    }
    return inventory.availableQuantity;
  }
}
