export interface CreateOrderPaymentOrder {
  orderId: string;
  subtotal: number;
}

export class CreateOrderPaymentCommand {
  constructor(
    public readonly payload: {
      checkoutId: string;
      customerId: string;
      totalAmount: number;
      currency?: string;
      orders: CreateOrderPaymentOrder[];
    },
  ) {}
}
