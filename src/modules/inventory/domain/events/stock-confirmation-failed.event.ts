import { IEvent } from '@nestjs/cqrs';

export interface FailedStockItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

export class StockConfirmationFailedEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly vendorId: string,
    public readonly transactionId: string,
    public readonly items: FailedStockItem[],
    public readonly amount: number,
    public readonly reason: string,
  ) {}
}
