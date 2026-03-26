export interface IInventoryPublicService {
  reserveStock(payload: ReserveStockPayload): Promise<void>;
  releaseStock(variantId: string, quantity: number): Promise<void>;
  confirmReservation(payload: ConfirmReservationPayload): Promise<void>;
  getAvailableStock(variantId: string): Promise<number>;
}

export const INVENTORY_PUBLIC_SERVICE = Symbol('INVENTORY_PUBLIC_SERVICE');

export interface StockItem {
  variantId: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface ConfirmReservationPayload {
  orderId: string;
  vendorId: string;
  checkoutId: string;
  items: StockItem[];
  amount: number;
}

export interface ReserveStockPayload {
  orders: {
    orderId: string;
    vendorId: string;
    items: StockItem[];
    amount: number;
  }[];
  checkoutId: string;
  totalAmount: number;
}
