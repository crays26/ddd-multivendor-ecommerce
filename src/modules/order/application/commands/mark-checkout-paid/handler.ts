import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkCheckoutPaidCommand } from './command';
import { CheckoutRepository } from 'src/modules/order/infrastructure/repositories/checkout.repo';
import { Transactional } from '@mikro-orm/core';
import {
  IOrderRepository,
  ORDER_REPO,
} from 'src/modules/order/domain/repositories/order.repo.interface';
import { Inject, NotFoundException } from '@nestjs/common';

@CommandHandler(MarkCheckoutPaidCommand)
export class MarkCheckoutPaidCommandHandler
  implements ICommandHandler<MarkCheckoutPaidCommand>
{
  constructor(
    private readonly checkoutRepository: CheckoutRepository,
    @Inject(ORDER_REPO)
    private readonly orderRepository: IOrderRepository,
  ) {}

  @Transactional()
  async execute(command: MarkCheckoutPaidCommand): Promise<void> {
    const { checkoutId } = command;

    try {
      const checkout = await this.checkoutRepository.findById(checkoutId);
      if (!checkout) {
        throw new NotFoundException(`Checkout with id ${checkoutId} not found`);
      }

      checkout.markPaid();

      const ordersToSetStatus =
        await this.orderRepository.findByCheckoutId(checkoutId);

      for (const order of ordersToSetStatus) {
        order.markPaid();
        await this.orderRepository.update(order);
      }

      await this.checkoutRepository.update(checkout);
    } catch (error) {
      console.log(error.message);
    }
  }
}
