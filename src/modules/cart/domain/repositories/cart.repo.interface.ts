import { BaseRepository } from 'src/shared/ddd/domain/base/repository.base';
import { CartAggRoot } from '../aggregate-roots/cart.agg-root';

export interface ICartRepository extends BaseRepository<CartAggRoot> {
  findByCustomerId(customerId: string): Promise<CartAggRoot | null>;
}

export const CART_REPO = Symbol('CART_REPO');
