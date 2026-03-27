import { BillingCustomerAggRoot } from '../../domain/aggregate-roots/billing-customer.agg-root';
import { BillingCustomerEntity } from '../entities/billing-customer.entity';

export class BillingCustomerDomainMapper {
  static fromPersistence(entity: BillingCustomerEntity): BillingCustomerAggRoot {
    return BillingCustomerAggRoot.rehydrate({
      id: entity.id,
      accountId: entity.account.id,
      providerCustomerId: entity.providerCustomerId,
      defaultPaymentMethodId: entity.defaultPaymentMethodId,
    });
  }

  static toPersistence(domain: BillingCustomerAggRoot): BillingCustomerEntity {
    const entity = new BillingCustomerEntity();
    entity.id = domain.getId();
    entity.providerCustomerId = domain.getProviderCustomerId();
    entity.defaultPaymentMethodId = domain.getDefaultPaymentMethodId();
    return entity;
  }
}





