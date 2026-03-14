import { Command } from '@nestjs/cqrs';

export interface ReserveStockItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

export class ReserveStockCommand extends Command<void> {
  constructor(
    public readonly payload: {
      orderId: string;
      vendorId: string;
      checkoutId: string;
      items: ReserveStockItem[];
      amount: number;
    },
  ) {
    super();
  }
}
