import { Command } from '@nestjs/cqrs';

interface ReserveStockItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

interface Order {
  orderId: string;
  vendorId: string;
  items: ReserveStockItem[];
  subtotal: number;
}

export class ReserveStockCommand extends Command<void> {
  constructor(
    public readonly payload: {
      orders: Order[];
      checkoutId: string;
      customerId: string;
      totalAmount: number;
    },
  ) {
    super();
  }
}
