import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { BillingVendorAggRoot } from '../../domain/aggregate-roots/billing-vendor.agg-root';
import { IBillingVendorRepository } from '../../domain/repositories/billing-vendor.repo.interface';
import { BillingVendorEntity } from '../entities/billing-vendor.entity';
import { BillingVendorDomainMapper } from '../mappers/billing-vendor.mapper';
import { VendorEntity } from 'src/modules/vendor/infrastructure/entities/vendor.entity';

@Injectable()
export class BillingVendorRepository implements IBillingVendorRepository {
  constructor(private readonly em: EntityManager) {}

  async insert(domain: BillingVendorAggRoot): Promise<void> {
    const entity = BillingVendorDomainMapper.toPersistence(domain);
    entity.vendor = this.em.getReference(VendorEntity, domain.getVendorId());
    this.em.persist(entity);
  }

  async update(domain: BillingVendorAggRoot): Promise<void> {
    const entity = await this.em.findOneOrFail(BillingVendorEntity, {
      id: domain.getId(),
    });
    entity.providerAccountId = domain.getProviderAccountId();
  }

  async findById(id: string): Promise<BillingVendorAggRoot | null> {
    const entity = await this.em.findOne(BillingVendorEntity, { id });
    if (!entity) return null;
    return BillingVendorDomainMapper.fromPersistence(entity);
  }

  async findByVendorId(
    vendorId: string,
  ): Promise<BillingVendorAggRoot | null> {
    const entity = await this.em.findOne(BillingVendorEntity, {
      vendor: vendorId,
    });
    if (!entity) return null;
    return BillingVendorDomainMapper.fromPersistence(entity);
  }
}





