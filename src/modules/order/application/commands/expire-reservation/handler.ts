import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(ExpireReservationCommandHandler.name);

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
      this.logger.warn(`Checkout ${checkoutId} not found, skipping expiry.`);
      return;
    }

    if (checkout.getStatus() !== CheckoutStatus.STOCK_RESERVED) {
      this.logger.log(
        `Checkout ${checkoutId} is in ${checkout.getStatus()} state, not STOCK_RESERVED. Skipping expiry.`,
      );
      return;
    }
    checkout.setStatus(CheckoutStatus.CANCELLED);
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

    this.logger.log(
      `Checkout ${checkoutId} expired. ${orders.length} orders cancelled, stock release event emitted.`,
    );
  }
}
