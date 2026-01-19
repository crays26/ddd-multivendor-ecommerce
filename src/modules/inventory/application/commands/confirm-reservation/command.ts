export interface ConfirmReservationItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

export class ConfirmReservationCommand {
  constructor(
    public readonly payload: {
      orderId: string;
      vendorId: string;
      transactionId: string;
      items: ConfirmReservationItem[];
      amount: number;
    },
  ) {}
}
