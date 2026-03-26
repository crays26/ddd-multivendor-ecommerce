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
import { StockReservationFailedEvent } from 'src/modules/inventory/domain/events/stock-reservation-failed.event';
import { StockReservedEvent } from 'src/modules/inventory/domain/events/stock-reserved.event';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/shared/ddd/infrastructure/unit-of-work/unit-of-work.interface';
import { instanceToPlain } from 'class-transformer';

@CommandHandler(ReserveStockCommand)
export class ReserveStockCommandHandler
  implements ICommandHandler<ReserveStockCommand>
{
  constructor(
    @Inject(INVENTORY_REPO)
    private readonly inventoryRepo: IInventoryRepository,
    private readonly outboxRepository: OutboxRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: ReserveStockCommand): Promise<void> {
    const { orders, checkoutId, customerId, totalAmount } = command.payload;

    const itemsToReserve = orders.flatMap((order) => order.items);

    await this.uow.transactional(async () => {
      for (const item of itemsToReserve) {
        try {
          await this.inventoryRepo.reserveStock(item.variantId, item.quantity);
        } catch (error) {
          const reason =
            error instanceof Error ? error.message : 'Stock reservation failed';

          const event = new StockReservationFailedEvent({
            checkoutId,
            orders,
            totalAmount,
            reason,
          });

          await this.outboxRepository.save(
            {
              id: uuidV7(),
              name: event.constructor.name,
              payload: instanceToPlain(event),
              status: Status.PENDING,
            },
            true,
          );
          throw error;
        }
      }
      const successEvent = new StockReservedEvent({
        checkoutId,
        customerId,
        orders,
        totalAmount,
      });

      await this.outboxRepository.save({
        id: uuidV7(),
        name: successEvent.constructor.name,
        payload: instanceToPlain(successEvent),
        status: Status.PENDING,
      });
    });
  }
}
