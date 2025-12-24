import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { AccountEntity } from '../entities/account.entity';
import { AccountAggRoot } from '../../domain/aggregate-root/account.agg-root';
import { IAccountRepository } from '../../domain/repositories/account.repo.interface';
import { AccountDomainMapper } from '../mappers/account.mapper';
import { RoleEntity } from '../entities/role.entity';
import { AddressEntity } from '../entities/address.entity';
import { Address } from '../../domain/entities/address.entity';

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    private readonly em: EntityManager,
  ) {}

  async insert(domain: AccountAggRoot) {
    const account = new AccountEntity();
    account.id = domain.getId();
    this.mapAggregateToEntity(domain, account);
    account.roles.set(
      domain.getRoles().map((r) => this.em.getReference(RoleEntity, r.getId())),
    );

    this.upsertAddresses(domain, account);

    this.em.persist(account);
  }

  async update(domain: AccountAggRoot): Promise<void> {
    const account: AccountEntity = await this.em.findOneOrFail(
      AccountEntity,
      {
        id: domain.getId(),
      },
      { populate: ['roles', 'addresses'] },
    );

    this.mapAggregateToEntity(domain, account);
    account.roles.set(
      domain.getRoles().map((r) => this.em.getReference(RoleEntity, r.getId())),
    );
    this.removeUnusedAddresses(domain, account);
    this.upsertAddresses(domain, account);

    this.em.persist(account);
  }

  async findById(id: string): Promise<AccountAggRoot | null> {
    const account = await this.em.findOne(
      AccountEntity,
      { id },
      { populate: ['roles', 'addresses'] },
    );
    if (!account) return null;
    return AccountDomainMapper.fromPersistence(account);
  }

  async findByEmail(email: string): Promise<AccountAggRoot | null> {
    const account = await this.em.findOne(
      AccountEntity,
      { email },
      { populate: ['roles', 'addresses'] },
    );
    if (!account) return null;
    return AccountDomainMapper.fromPersistence(account);
  }

  private mapAggregateToEntity(domain: AccountAggRoot, entity: AccountEntity): void {
    entity.username = domain.getUsername();
    entity.email = domain.getEmail();
    entity.password = domain.getPassword();

  }

  private mapAddressToEntity(
    domainAddress: Address,
    entityAddress: AddressEntity,
    account: AccountEntity,
  ): void {
    entityAddress.account = account;
    entityAddress.fullName = domainAddress.getFullName();
    entityAddress.phoneNumber = domainAddress.getPhoneNumber();
    entityAddress.street = domainAddress.getStreet();
    entityAddress.unit = domainAddress.getUnit();
    entityAddress.ward = domainAddress.getWard();
    entityAddress.city = domainAddress.getCity();
    entityAddress.region = domainAddress.getRegion();
    entityAddress.postalCode = domainAddress.getPostalCode();
    entityAddress.countryCode = domainAddress.getCountryCode();
    entityAddress.isDefault = domainAddress.isDefault();
    entityAddress.label = domainAddress.getLabel();
  }

  private removeUnusedAddresses(
    domain: AccountAggRoot,
    entity: AccountEntity,
  ): void {
    const domainIds = domain.getAddresses().map((a) => a.getId());
    const existing = entity.addresses.getItems();

    for (const addr of existing) {
      if (!domainIds.includes(addr.id)) {
        entity.addresses.remove(addr);
        this.em.remove(addr);
      }
    }
  }

  private upsertAddresses(
    domain: AccountAggRoot,
    entity: AccountEntity,
  ): void {
    const existing = entity.addresses.getItems();

    for (const addr of domain.getAddresses()) {
      let address = existing.find((ea) => ea.id === addr.getId());

      if (!address) {
        address = new AddressEntity();
        address.id = addr.getId();
        entity.addresses.add(address);
      }

      this.mapAddressToEntity(addr, address, entity);
    }
  }
}
