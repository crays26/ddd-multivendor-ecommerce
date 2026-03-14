import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ReserveStockCommand } from './command';
import {
  IInventoryRepository,
  INVENTORY_REPO,
} from '../../../domain/repositories/inventory.repo.interface';
import { OutboxRepository } from 'src/shared/ddd/infrastructure/outbox/outbox.repo';
import { v7 as uuidV7 } from 'uuid';
import { Status } from 'src/shared/ddd/infrastructure/outbox/outbox.entity';
import { Transactional } from '@mikro-orm/core';
import { StockReservationFailedEvent } from 'src/modules/inventory/domain/events/stock-reservation-failed.event';

@CommandHandler(ReserveStockCommand)
export class ReserveStockCommandHandler
  implements ICommandHandler<ReserveStockCommand>
{
  constructor(
    @Inject(INVENTORY_REPO)
    private readonly inventoryRepo: IInventoryRepository,
    private readonly outboxRepository: OutboxRepository,
  ) {}

  @Transactional()
  async execute(command: ReserveStockCommand): Promise<void> {
    const { orderId, vendorId, checkoutId, items, amount } = command.payload;

    try {
      await Promise.all(
        items.map((item) =>
          this.inventoryRepo.reserveStock(item.variantId, item.quantity),
        ),
      );
    } catch (error) {
      const failedEvent = new StockReservationFailedEvent(
        orderId,
        vendorId,
        checkoutId,
        items,
        amount,
        error instanceof Error ? error.message : 'Stock reservation failed',
      );

      await this.outboxRepository.save({
        id: uuidV7(),
        name: failedEvent.constructor.name,
        payload: failedEvent,
        status: Status.PENDING,
        createdAt: new Date(),
      });
      throw error;
    }
  }
}
