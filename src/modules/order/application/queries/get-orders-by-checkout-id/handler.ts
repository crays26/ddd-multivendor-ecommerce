import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetOrdersByCheckoutIdQuery } from './query';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { OrderEntity } from 'src/modules/order/infrastructure/entities/order.entity';
import { OrdersByCheckoutIdDto } from './dto';

@QueryHandler(GetOrdersByCheckoutIdQuery)
export class GetOrdersByCheckoutIdHandler
  implements IQueryHandler<GetOrdersByCheckoutIdQuery>
{
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: EntityRepository<OrderEntity>,
  ) {}

  async execute(
    query: GetOrdersByCheckoutIdQuery,
  ): Promise<OrdersByCheckoutIdDto[]> {
    const orders = await this.orderRepository.find(
      { checkout: { id: query.checkoutId } },
      { populate: ['vendor', 'lineItems.productVariant'] },
    );

    return orders.map((order) => ({
      orderId: order.id,
      vendorId: order.vendor.id,
      items: order.lineItems.getItems().map((item) => ({
        variantId: item.productVariant.id,
        quantity: item.quantity,
        priceAtPurchase: item.price,
      })),
      subtotal: order.totalAmount,
    }));
  }
}
