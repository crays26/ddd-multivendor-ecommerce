import { BaseRepository } from 'src/shared/ddd/domain/base/repository.base';
import { ProductAggRoot } from 'src/modules/product/domain/aggregate-roots/product.agg-root';

export interface IProductRepository extends BaseRepository<ProductAggRoot> {}

export const PRODUCT_REPO = Symbol('PRODUCT_REPO');
