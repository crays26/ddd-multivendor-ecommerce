import { Injectable, Inject } from '@nestjs/common';
import {
  IOrderRepository,
  ORDER_REPO,
} from 'src/modules/order/domain/repositories/order.repo.interface';
import { OrderGroupEventOrder } from '../../domain/events/order-group-created.event';

export interface IOrderPublicService {
  getOrdersByCheckoutId(checkoutId: string): Promise<OrderGroupEventOrder[]>;
}

export const ORDER_PUBLIC_SERVICE = Symbol('ORDER_PUBLIC_SERVICE');

@Injectable()
export class OrderPublicService implements IOrderPublicService {
  constructor(
    @Inject(ORDER_REPO)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async getOrdersByCheckoutId(
    checkoutId: string,
  ): Promise<OrderGroupEventOrder[]> {
    const orders = await this.orderRepository.findByCheckoutId(checkoutId);

    return orders.map((order) => ({
      orderId: order.getId(),
      vendorId: order.getVendorId(),
      items: order.getOrderItems().map((item) => ({
        variantId: item.getProductVariantId(),
        quantity: item.getQuantity(),
        priceAtPurchase: item.getPriceAtPurchase(),
      })),
      subtotal: order.getTotalAmount(),
    }));
  }
}
