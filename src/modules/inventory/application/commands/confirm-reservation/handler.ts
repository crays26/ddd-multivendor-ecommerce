import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ConfirmReservationCommand } from './command';
import {
  IInventoryRepository,
  INVENTORY_REPO,
} from '../../../domain/repositories/inventory.repo.interface';
import { OutboxRepository } from 'src/shared/ddd/infrastructure/outbox/outbox.repo';
import { StockConfirmationFailedEvent } from '../../../domain/events/stock-confirmation-failed.event';
import { v7 as uuidV7 } from 'uuid';
import { Status } from 'src/shared/ddd/infrastructure/outbox/outbox.entity';
import { Transactional } from '@mikro-orm/core';

@CommandHandler(ConfirmReservationCommand)
export class ConfirmReservationCommandHandler
  implements ICommandHandler<ConfirmReservationCommand>
{
  constructor(
    @Inject(INVENTORY_REPO)
    private readonly inventoryRepo: IInventoryRepository,
    private readonly outboxRepository: OutboxRepository,
  ) {}

  @Transactional()
  async execute(command: ConfirmReservationCommand): Promise<void> {
    const { orderId, vendorId, checkoutId, transactionId, items, amount } =
      command.payload;

    try {
      await Promise.all(
        items.map((item) =>
          this.inventoryRepo.confirmReservation(item.variantId, item.quantity),
        ),
      );
    } catch (error) {
      const failedEvent = new StockConfirmationFailedEvent({
        orderId,
        vendorId,
        checkoutId,
        transactionId,
        items,
        amount,
        reason:
          error instanceof Error ? error.message : 'Stock confirmation failed',
      });

      await this.outboxRepository.save({
        id: uuidV7(),
        name: failedEvent.constructor.name,
        payload: failedEvent,
        status: Status.PENDING,
      });
      throw error;
    }
  }
}
