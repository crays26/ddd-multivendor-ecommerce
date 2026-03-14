import { IEvent } from '@nestjs/cqrs';

interface FailedStockItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

export class StockReservationFailedEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly vendorId: string,
    public readonly checkoutId: string,
    public readonly items: FailedStockItem[],
    public readonly amount: number,
    public readonly reason: string,
  ) {}
}
