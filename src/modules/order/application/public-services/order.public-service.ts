import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { OrdersByCheckoutIdDto } from '../queries/get-orders-by-checkout-id/dto';
import { GetOrdersByCheckoutIdQuery } from '../queries/get-orders-by-checkout-id/query';
import { IOrderPublicService } from './order.public-service.interface';

@Injectable()
export class OrderPublicService implements IOrderPublicService {
  constructor(private readonly queryBus: QueryBus) {}

  async getOrdersByCheckoutId(
    checkoutId: string,
  ): Promise<OrdersByCheckoutIdDto[]> {
    return this.queryBus.execute(new GetOrdersByCheckoutIdQuery(checkoutId));
  }
}
