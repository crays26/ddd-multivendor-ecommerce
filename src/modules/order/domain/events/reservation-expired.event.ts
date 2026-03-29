export interface ReservationExpiredItem {
  variantId: string;
  quantity: number;
}

export interface ReservationExpiredOrder {
  orderId: string;
  vendorId: string;
  items: ReservationExpiredItem[];
}

export class ReservationExpiredEvent {
  constructor(
    public readonly payload: {
      checkoutId: string;
      orders: ReservationExpiredOrder[];
    },
  ) {}
}
