import { EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { VendorEntity } from '../entities/vendor.entity';
import { VendorAggRoot } from '../../domain/aggregate-roots/vendor.agg-root';
import { Account } from '../../../account/infrastructure/entities/account.entity';

@Injectable()
export class VendorRepository {
  constructor(
    private readonly em: EntityManager,
  ) {}

  async insert(domain: VendorAggRoot): Promise<void> {
    const vendor = new VendorEntity();
    vendor.id = domain.getId();
    vendor.name = domain.getName();
    vendor.description = domain.getDescription();
    vendor.account = this.em.getReference(Account, domain.getAccountId());

    this.em.persist(vendor);
  }
}
