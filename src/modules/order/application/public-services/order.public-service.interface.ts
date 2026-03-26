import { OrdersByCheckoutIdDto } from '../queries/get-orders-by-checkout-id/dto';

export interface IOrderPublicService {
  getOrdersByCheckoutId(checkoutId: string): Promise<OrdersByCheckoutIdDto[]>;
}

export const ORDER_PUBLIC_SERVICE = Symbol('ORDER_PUBLIC_SERVICE');
