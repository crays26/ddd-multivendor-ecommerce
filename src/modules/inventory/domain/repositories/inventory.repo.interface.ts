import { BaseRepository } from 'src/shared/ddd/domain/base/repository.base';
import { InventoryAggRoot } from '../aggregate-roots/inventory.agg-root';

export interface IInventoryRepository extends BaseRepository<InventoryAggRoot> {
  findByVariantId(variantId: string): Promise<InventoryAggRoot | null>;
  findByVariantIds(variantIds: string[]): Promise<InventoryAggRoot[]>;
  confirmReservation(variantId: string, amount: number): Promise<void>;
  reserveStock(variantId: string, amount: number): Promise<void>;
  releaseStock(variantId: string, amount: number): Promise<void>;
  restock(variantId: string, amount: number): Promise<void>;
}

export const INVENTORY_REPO = Symbol('INVENTORY_REPO');
