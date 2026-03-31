import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkCheckoutStockReservedCommand } from './command';
import { CheckoutRepository } from 'src/modules/order/infrastructure/repositories/checkout.repo';
import { Transactional } from '@mikro-orm/core';
import {
  IOrderRepository,
  ORDER_REPO,
} from 'src/modules/order/domain/repositories/order.repo.interface';
import { CheckoutStockReservationCompletedEvent } from 'src/modules/order/domain/events/checkout-stock-reservation-completed';
import { Inject, NotFoundException } from '@nestjs/common';
import { OutboxRepository } from 'src/shared/ddd/infrastructure/outbox/outbox.repo';
import { v7 as uuidV7 } from 'uuid';
import { Status } from 'src/shared/ddd/infrastructure/outbox/outbox.entity';
import { instanceToPlain } from 'class-transformer';
import { EVENT_NAMES } from 'src/shared/ddd/infrastructure/queue/constants';

@CommandHandler(MarkCheckoutStockReservedCommand)
export class MarkCheckoutStockReservedCommandHandler
  implements ICommandHandler<MarkCheckoutStockReservedCommand>
{
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    @Inject(ORDER_REPO)
    private readonly orderRepository: IOrderRepository,
    private readonly outboxRepository: OutboxRepository,
  ) {}

  @Transactional()
  async execute(command: MarkCheckoutStockReservedCommand): Promise<void> {
    const { orders, checkoutId, customerId, totalAmount } = command.payload;
    const checkout = await this.checkoutRepository.findById(checkoutId);
    if (!checkout) {
      throw new NotFoundException(`Checkout with id ${checkoutId} not found`);
    }
    checkout.markStockReserved();

    const ordersToSetStatus =
      await this.orderRepository.findByCheckoutId(checkoutId);

    for (const order of ordersToSetStatus) {
      order.markStockReserved();
      await this.orderRepository.update(order);
    }
    await this.checkoutRepository.update(checkout);

    const event = new CheckoutStockReservationCompletedEvent({
      checkoutId,
      customerId,
      orders,
      totalAmount,
    });
    await this.outboxRepository.save({
      id: uuidV7(),
      name: event.constructor.name,
      payload: instanceToPlain(event),
      status: Status.PENDING,
    });

    await this.outboxRepository.save({
      id: uuidV7(),
      name: EVENT_NAMES.CHECK_RESERVATION_EXPIRY,
      payload: { checkoutId },
      status: Status.PENDING,
      delay: 15 * 60 * 1000,
    });
  }
}
