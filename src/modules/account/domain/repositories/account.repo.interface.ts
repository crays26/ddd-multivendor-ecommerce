import { Account } from '../../infrastructure/entities/account.entity';
import { AccountAggRoot } from '../aggregate-root/account.agg-root';

export interface IAccountRepository {
    
  save(domain: AccountAggRoot): Promise<void>;
  findById(id: string): Promise<AccountAggRoot | null>;
  findByEmail(email: string): Promise<AccountAggRoot | null>;
}

export const ACCOUNT_REPO = Symbol('ACCOUNT_REPO')
