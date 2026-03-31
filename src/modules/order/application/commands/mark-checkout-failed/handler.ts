import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkCheckoutFailedCommand } from './command';
import { CheckoutRepository } from 'src/modules/order/infrastructure/repositories/checkout.repo';
import { Transactional } from '@mikro-orm/core';
import {
  IOrderRepository,
  ORDER_REPO,
} from 'src/modules/order/domain/repositories/order.repo.interface';
import { Inject, NotFoundException } from '@nestjs/common';
import { CheckoutStatus } from 'src/modules/order/domain/aggregate-roots/checkout.agg-root';

@CommandHandler(MarkCheckoutFailedCommand)
export class MarkCheckoutFailedCommandHandler
  implements ICommandHandler<MarkCheckoutFailedCommand>
{
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    @Inject(ORDER_REPO)
    private readonly orderRepository: IOrderRepository,
  ) {}

  @Transactional()
  async execute(command: MarkCheckoutFailedCommand): Promise<void> {
    const { checkoutId } = command;
    const checkout = await this.checkoutRepository.findById(checkoutId);
    if (!checkout) {
      throw new NotFoundException(`Checkout not found with id: ${checkoutId}`);
    }
    if (checkout.getStatus() === CheckoutStatus.CANCELLED) {
      checkout.cancel();
    } else {
      checkout.markFailed();
    }

    const orders = await this.orderRepository.findByCheckoutId(checkoutId);
    for (const order of orders) {
      if (checkout.getStatus() === CheckoutStatus.CANCELLED) {
        order.cancelOrder();
      } else {
        order.failOrder();
      }
      await this.orderRepository.update(order);
    }

    await this.checkoutRepository.update(checkout);
  }
}
