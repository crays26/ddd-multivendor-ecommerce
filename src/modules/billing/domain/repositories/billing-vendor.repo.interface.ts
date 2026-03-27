import { BaseRepository } from 'src/shared/ddd/domain/base/repository.base';
import { BillingVendorAggRoot } from '../aggregate-roots/billing-vendor.agg-root';

export interface IBillingVendorRepository
  extends BaseRepository<BillingVendorAggRoot> {
  findByVendorId(vendorId: string): Promise<BillingVendorAggRoot | null>;
}

export const BILLING_VENDOR_REPO = Symbol('BILLING_VENDOR_REPO');





