import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { BillingCustomerAggRoot } from '../../domain/aggregate-roots/billing-customer.agg-root';
import { IBillingCustomerRepository } from '../../domain/repositories/billing-customer.repo.interface';
import { BillingCustomerEntity } from '../entities/billing-customer.entity';
import { BillingCustomerDomainMapper } from '../mappers/billing-customer.mapper';
import { AccountEntity } from 'src/modules/account/infrastructure/entities/account.entity';

@Injectable()
export class BillingCustomerRepository implements IBillingCustomerRepository {
  constructor(private readonly em: EntityManager) {}

  async insert(domain: BillingCustomerAggRoot): Promise<void> {
    const entity = BillingCustomerDomainMapper.toPersistence(domain);
    entity.account = this.em.getReference(AccountEntity, domain.getAccountId());
    this.em.persist(entity);
  }

  async update(domain: BillingCustomerAggRoot): Promise<void> {
    const entity = await this.em.findOneOrFail(BillingCustomerEntity, {
      id: domain.getId(),
    });
    entity.providerCustomerId = domain.getProviderCustomerId();
    entity.defaultPaymentMethodId = domain.getDefaultPaymentMethodId();
  }

  async findById(id: string): Promise<BillingCustomerAggRoot | null> {
    const entity = await this.em.findOne(BillingCustomerEntity, { id });
    if (!entity) return null;
    return BillingCustomerDomainMapper.fromPersistence(entity);
  }

  async findByAccountId(
    accountId: string,
  ): Promise<BillingCustomerAggRoot | null> {
    const entity = await this.em.findOne(BillingCustomerEntity, {
      account: accountId,
    });
    if (!entity) return null;
    return BillingCustomerDomainMapper.fromPersistence(entity);
  }

  async findByProviderCustomerId(
    id: string,
  ): Promise<BillingCustomerAggRoot | null> {
    const entity = await this.em.findOne(BillingCustomerEntity, {
      providerCustomerId: id,
    });
    if (!entity) return null;
    return BillingCustomerDomainMapper.fromPersistence(entity);
  }
}





