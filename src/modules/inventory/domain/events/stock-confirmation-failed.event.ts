import { IEvent } from '@nestjs/cqrs';

interface FailedStockItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

export class StockConfirmationFailedEvent implements IEvent {
  constructor(
    public readonly payload: {
      orderId: string;
      vendorId: string;
      checkoutId: string;
      transactionId: string;
      items: FailedStockItem[];
      amount: number;
      reason: string;
    },
  ) {}
}
