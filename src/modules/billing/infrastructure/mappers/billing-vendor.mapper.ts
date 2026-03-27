import { BillingVendorAggRoot } from '../../domain/aggregate-roots/billing-vendor.agg-root';
import { BillingVendorEntity } from '../entities/billing-vendor.entity';

export class BillingVendorDomainMapper {
  static fromPersistence(entity: BillingVendorEntity): BillingVendorAggRoot {
    return BillingVendorAggRoot.rehydrate({
      id: entity.id,
      vendorId: entity.vendor.id,
      providerAccountId: entity.providerAccountId,
    });
  }

  static toPersistence(domain: BillingVendorAggRoot): BillingVendorEntity {
    const entity = new BillingVendorEntity();
    entity.id = domain.getId();
    entity.providerAccountId = domain.getProviderAccountId();
    return entity;
  }
}





