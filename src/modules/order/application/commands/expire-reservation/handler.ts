import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Transactional } from '@mikro-orm/core';
import { ExpireReservationCommand } from './command';
import { CheckoutRepository } from 'src/modules/order/infrastructure/repositories/checkout.repo';
import { CheckoutStatus } from 'src/modules/order/domain/aggregate-roots/checkout.agg-root';
import {
  IOrderRepository,
  ORDER_REPO,
} from 'src/modules/order/domain/repositories/order.repo.interface';
import { OutboxRepository } from 'src/shared/ddd/infrastructure/outbox/outbox.repo';
import { v7 as uuidV7 } from 'uuid';
import { Status } from 'src/shared/ddd/infrastructure/outbox/outbox.entity';
import { instanceToPlain } from 'class-transformer';
import {
  ReservationExpiredEvent,
  ReservationExpiredOrder,
} from 'src/modules/order/domain/events/reservation-expired.event';

@CommandHandler(ExpireReservationCommand)
export class ExpireReservationCommandHandler
  implements ICommandHandler<ExpireReservationCommand>
{
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    @Inject(ORDER_REPO)
    private readonly orderRepository: IOrderRepository,
    private readonly outboxRepository: OutboxRepository,
  ) {}

  @Transactional()
  async execute(command: ExpireReservationCommand): Promise<void> {
    const { checkoutId } = command;

    const checkout = await this.checkoutRepository.findById(checkoutId);
    if (!checkout) {
      return;
    }

    if (checkout.getStatus() !== CheckoutStatus.STOCK_RESERVED) {
      return;
    }
    checkout.cancel();
    await this.checkoutRepository.update(checkout);

    const orders = await this.orderRepository.findByCheckoutId(checkoutId);
    const expiredOrders: ReservationExpiredOrder[] = [];

    for (const order of orders) {
      order.cancelOrder();
      await this.orderRepository.update(order);
      expiredOrders.push({
        orderId: order.getId(),
        vendorId: order.getVendorId(),
        items: order.getOrderItems().map((item) => ({
          variantId: item.getProductVariantId(),
          quantity: item.getQuantity(),
        })),
      });
    }
    const event = new ReservationExpiredEvent({
      checkoutId,
      orders: expiredOrders,
    });

    await this.outboxRepository.save({
      id: uuidV7(),
      name: event.constructor.name,
      payload: instanceToPlain(event),
      status: Status.PENDING,
    });
  }
}
