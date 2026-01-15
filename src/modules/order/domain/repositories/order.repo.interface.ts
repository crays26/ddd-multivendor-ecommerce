import { BaseRepository } from 'src/shared/ddd/domain/base/repository.base';
import { OrderAggRoot } from 'src/modules/order/domain/aggregate-roots/order.agg-root';

export interface IOrderRepository extends BaseRepository<OrderAggRoot> {
  findByOrderGroupId(orderGroupId: string): Promise<OrderAggRoot[]>;
  bulkInsert(aggregates: OrderAggRoot[]): Promise<void>;
}

export const ORDER_REPO = Symbol('ORDER_REPO');
