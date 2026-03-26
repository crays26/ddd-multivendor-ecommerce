import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateInventoryCommand } from './command';
import { Inject } from '@nestjs/common';
import { INVENTORY_REPO } from '../../../domain/repositories/inventory.repo.interface';
import { IInventoryRepository } from '../../../domain/repositories/inventory.repo.interface';
import { InventoryAggRoot } from 'src/modules/inventory/domain/aggregate-roots/inventory.agg-root';

@CommandHandler(CreateInventoryCommand)
export class CreateInventoryCommandHandler
  implements ICommandHandler<CreateInventoryCommand>
{
  constructor(
    @Inject(INVENTORY_REPO)
    private readonly inventoryRepo: IInventoryRepository,
  ) {}

  async execute(command: CreateInventoryCommand): Promise<void> {
    const aggregates = command.variants.map((variant) =>
      InventoryAggRoot.create(variant),
    );

    await this.inventoryRepo.bulkInsert(aggregates);
  }
}
