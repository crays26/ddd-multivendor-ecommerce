import { IEvent } from '@nestjs/cqrs';

export interface OrderItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

export class OrderCreatedEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly vendorId: string,
    public readonly items: OrderItem[],
    public readonly totalAmount: number,
  ) {}
}
