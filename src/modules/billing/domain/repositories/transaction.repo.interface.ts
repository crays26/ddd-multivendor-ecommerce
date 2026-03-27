import { BaseRepository } from 'src/shared/ddd/domain/base/repository.base';
import { TransactionAggRoot } from '../aggregate-roots/transaction.agg-root';

export interface ITransactionRepository
  extends BaseRepository<TransactionAggRoot> {
  findById(id: string): Promise<TransactionAggRoot | null>;
  findByProviderIntentId(id: string): Promise<TransactionAggRoot | null>;
}

export const TRANSACTION_REPO = Symbol('TRANSACTION_REPO');

