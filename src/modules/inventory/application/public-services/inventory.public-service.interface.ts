import { ConfirmReservationItem } from '../commands/confirm-reservation/command';

export interface ConfirmReservationPayload {
  orderId: string;
  vendorId: string;
  transactionId: string;
  items: ConfirmReservationItem[];
  amount: number;
}

export interface IInventoryPublicService {
  reserveStock(variantId: string, quantity: number): Promise<void>;
  releaseStock(variantId: string, quantity: number): Promise<void>;
  confirmReservation(payload: ConfirmReservationPayload): Promise<void>;
  getAvailableStock(variantId: string): Promise<number>;
}

export const INVENTORY_PUBLIC_SERVICE = Symbol('INVENTORY_PUBLIC_SERVICE');
