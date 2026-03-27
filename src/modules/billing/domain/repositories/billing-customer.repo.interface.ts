import { BaseRepository } from 'src/shared/ddd/domain/base/repository.base';
import { BillingCustomerAggRoot } from '../aggregate-roots/billing-customer.agg-root';

export interface IBillingCustomerRepository
  extends BaseRepository<BillingCustomerAggRoot> {
  findByAccountId(accountId: string): Promise<BillingCustomerAggRoot | null>;
  findByProviderCustomerId(id: string): Promise<BillingCustomerAggRoot | null>;
}

export const BILLING_CUSTOMER_REPO = Symbol('BILLING_CUSTOMER_REPO');





