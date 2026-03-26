import { IEvent } from '@nestjs/cqrs';

interface ReservedStockItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

interface ReservedOrder {
  orderId: string;
  vendorId: string;
  items: ReservedStockItem[];
  subtotal: number;
}

export class StockReservedEvent implements IEvent {
  constructor(
    public readonly payload: {
      checkoutId: string;
      customerId: string;
      orders: ReservedOrder[];
      totalAmount: number;
    },
  ) {}
}
