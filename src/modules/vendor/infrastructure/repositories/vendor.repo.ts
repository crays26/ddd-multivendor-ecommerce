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
    @InjectRepository(VendorEntity)
    private readonly repo: EntityRepository<VendorEntity>,
    private readonly em: EntityManager,
  ) {}

  async save(domain: VendorAggRoot): Promise<void> {
    let vendor: VendorEntity | null = await this.repo.findOne(
      { id: domain.getId() },
      { populate: ['account'] },
    );
    if (!vendor) {
      vendor = new VendorEntity();
      vendor.id = domain.getId();
    }

    vendor.name = domain.getName();
    vendor.description = domain.getDescription();
    vendor.account = this.em.getReference(Account, domain.getAccountId());

    await this.em.persistAndFlush(vendor);
  }
}
