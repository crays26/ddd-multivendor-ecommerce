import { EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { VendorEntity } from '../entities/vendor.entity';
import { VendorAggRoot } from '../../domain/aggregate-roots/vendor.agg-root';
import { AccountEntity } from '../../../account/infrastructure/entities/account.entity';

@Injectable()
export class VendorRepository {
  constructor(private readonly em: EntityManager) {}

  async insert(domain: VendorAggRoot): Promise<void> {
    const vendor = new VendorEntity();
    vendor.id = domain.getId();
    vendor.name = domain.getName();
    vendor.slug = domain.getSlug();
    vendor.description = domain.getDescription();
    vendor.rating = domain.getRating();
    vendor.account = this.em.getReference(AccountEntity, domain.getAccountId());

    this.em.persist(vendor);
  }

  async update(domain: VendorAggRoot): Promise<void> {
    let vendor: VendorEntity = await this.em.findOneOrFail(VendorEntity, {
      id: domain.getId(),
    });
    vendor.name = domain.getName();
    vendor.slug = domain.getSlug();
    vendor.description = domain.getDescription();
    vendor.rating = domain.getRating();
  }
}
