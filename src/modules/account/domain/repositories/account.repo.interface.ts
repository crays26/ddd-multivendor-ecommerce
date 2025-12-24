import { AccountAggRoot } from '../aggregate-root/account.agg-root';
import { BaseRepository } from 'src/shared/ddd/domain/base/repository.base';

export interface IAccountRepository extends BaseRepository<AccountAggRoot> {
  findByEmail(email: string): Promise<AccountAggRoot | null>;
}

export const ACCOUNT_REPO = Symbol('ACCOUNT_REPO');
