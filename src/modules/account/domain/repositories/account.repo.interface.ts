import { Account } from '../../infrastructure/entities/account.entity';
import { AccountDomainEntity } from '../aggregate-root/account';

export interface IAccountRepository {
    
  save(domain: AccountDomainEntity): Promise<void>;
  findById(id: string): Promise<AccountDomainEntity | null>;
  findByEmail(email: string): Promise<AccountDomainEntity | null>;
}

export const ACCOUNT_REPO = Symbol('ACCOUNT_REPO')
