import { Command } from '@nestjs/cqrs';

interface MarkCheckoutStockReservedItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

interface MarkCheckoutStockReservedOrder {
  orderId: string;
  vendorId: string;
  items: MarkCheckoutStockReservedItem[];
  subtotal: number;
}

export class MarkCheckoutStockReservedCommand extends Command<void> {
  constructor(
    public readonly payload: {
      orders: MarkCheckoutStockReservedOrder[];
      checkoutId: string;
      customerId: string;
      totalAmount: number;
    },
  ) {
    super();
  }
}
