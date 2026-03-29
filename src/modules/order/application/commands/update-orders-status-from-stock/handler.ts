import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { Transactional } from '@mikro-orm/core';
import { UpdateOrdersStatusFromStockCommand } from './command';
import {
  IOrderRepository,
  ORDER_REPO,
} from 'src/modules/order/domain/repositories/order.repo.interface';
import { OrderResultStatus } from 'src/modules/inventory/domain/events/stock-confirmation-completed.event';

@CommandHandler(UpdateOrdersStatusFromStockCommand)
export class UpdateOrdersStatusFromStockHandler
  implements ICommandHandler<UpdateOrdersStatusFromStockCommand>
{
  constructor(
    @Inject(ORDER_REPO)
    private readonly orderRepository: IOrderRepository,
  ) {}

  @Transactional()
  async execute(command: UpdateOrdersStatusFromStockCommand): Promise<void> {
    const { checkoutId, orderResults } = command.payload;

    const orders = await this.orderRepository.findByCheckoutId(checkoutId);

    if (orders.length === 0) {
      return;
    }

    for (const result of orderResults) {
      const order = orders.find((o) => o.getId() === result.orderId);

      if (!order) {
        throw new NotFoundException(
          `Order ${result.orderId} not found in checkout ${checkoutId}`,
        );
      }

      if (result.status === OrderResultStatus.SUCCEEDED) {
        order.confirmStockSuccess();
      } else {
        order.confirmStockFailed();
      }

      await this.orderRepository.update(order);
    }
  }
}
