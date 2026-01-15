import { IEvent } from '@nestjs/cqrs';

export interface OrderGroupEventItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface OrderGroupEventOrder {
  orderId: string;
  vendorId: string;
  items: OrderGroupEventItem[];
  subtotal: number;
}

export class OrderGroupCreatedEvent implements IEvent {
  constructor(
    public readonly orderGroupId: string,
    public readonly customerId: string,
    public readonly orders: OrderGroupEventOrder[],
    public readonly totalAmount: number,
  ) {}
}
