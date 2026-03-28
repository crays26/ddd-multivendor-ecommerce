import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ConfirmReservationCommand } from './command';
import {
  IInventoryRepository,
  INVENTORY_REPO,
} from '../../../domain/repositories/inventory.repo.interface';
import { OutboxRepository } from 'src/shared/ddd/infrastructure/outbox/outbox.repo';
import { v7 as uuidV7 } from 'uuid';
import { Status } from 'src/shared/ddd/infrastructure/outbox/outbox.entity';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/shared/ddd/infrastructure/unit-of-work/unit-of-work.interface';
import { StockConfirmationCompletedEvent } from 'src/modules/inventory/domain/events/stock-confirmation-completed.event';
import {
  OrderResult,
  OrderResultStatus,
} from 'src/modules/inventory/domain/events/stock-confirmation-completed.event';
import { instanceToPlain } from 'class-transformer';

@CommandHandler(ConfirmReservationCommand)
export class ConfirmReservationCommandHandler
  implements ICommandHandler<ConfirmReservationCommand>
{
  constructor(
    @Inject(INVENTORY_REPO)
    private readonly inventoryRepo: IInventoryRepository,
    private readonly outboxRepository: OutboxRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: ConfirmReservationCommand): Promise<void> {
    const { orders, checkoutId, transactionId, customerId, totalAmount } =
      command.payload;

    await this.uow.transactional(async () => {
      const orderResults: OrderResult[] = [];

      for (const order of orders) {
        try {
          await this.uow.transactional(async () => {
            for (const item of order.items) {
              await this.inventoryRepo.confirmReservation(
                item.variantId,
                item.quantity,
              );
            }
          });
          orderResults.push({
            orderId: order.orderId,
            subtotal: order.subtotal,
            vendorId: order.vendorId,
            status: OrderResultStatus.SUCCEEDED,
          });
        } catch (error) {
          await this.uow.transactional(async () => {
            for (const item of order.items) {
              await this.inventoryRepo.releaseStock(
                item.variantId,
                item.quantity,
              );
            }
          });
          orderResults.push({
            orderId: order.orderId,
            subtotal: order.subtotal,
            vendorId: order.vendorId,
            status: OrderResultStatus.FAILED,
          });
        }
      }
      const event = new StockConfirmationCompletedEvent({
        checkoutId,
        transactionId,
        customerId,
        totalAmount,
        orderResults,
      });

      await this.outboxRepository.save({
        id: uuidV7(),
        name: event.constructor.name,
        payload: instanceToPlain(event),
        status: Status.PENDING,
      });
    });
  }
}
