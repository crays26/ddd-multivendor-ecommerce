import { BaseRepository } from 'src/shared/ddd/domain/base/repository.base';
import { OrderAggRoot } from 'src/modules/order/domain/aggregate-roots/order.agg-root';

export interface IOrderRepository extends BaseRepository<OrderAggRoot> {}

const ORDER_REPO = Symbol('ORDER_REPO');
