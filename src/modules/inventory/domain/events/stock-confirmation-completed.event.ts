export enum OrderResultStatus {
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

export interface OrderResult {
  orderId: string;
  vendorId: string;
  subtotal: number;
  status: OrderResultStatus;
}
export class StockConfirmationCompletedEvent {
  constructor(
    public readonly payload: {
      checkoutId: string;
      transactionId: string;
      customerId: string;
      totalAmount: number;
      orderResults: OrderResult[];
    },
  ) {}
}
