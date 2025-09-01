import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Account } from '../entities/account.entity';
import { AccountDomainEntity } from '../../domain/aggregate-root/account';
import { IAccountRepository } from '../../domain/repositories/account.repo.interface';
import { AccountDomainMapper } from '../mappers/account.mapper';
import { Role } from '../entities/role.entity';

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    @InjectRepository(Account)
    private readonly repo: EntityRepository<Account>,
    private readonly em: EntityManager,
  ) {}

  async save(domain: AccountDomainEntity): Promise<void> {
    let account: Account | null = await this.repo.findOne(
      { id: domain.getId() },
      { populate: ['roles'] },
    );

    if (!account) {
      account = new Account();
      account.id = domain.getId();
    }
    account.username = domain.getUsername();
    account.email = domain.getEmail();
    account.password = domain.getPassword();

    const roles = domain.getRoles().map(
      (r) => this.em.getReference(Role, r.getId())
    );
    account.roles.set(roles);
    this.em.persist(account);
  }

  async create(domain: AccountDomainEntity) {
    const account = new Account();
    account.id = domain.getId();
    account.username = domain.getUsername();
    account.email = domain.getEmail();
    account.password = domain.getPassword();

    await this.em.persistAndFlush(account);

    return account;
  }

  async findById(id: string): Promise<AccountDomainEntity | null> {
    const account = await this.repo.findOne(
      { id },
      { populate: ['roles'] },
    );
    if (!account) return null;
    return AccountDomainMapper.fromPersistence(account);
  }

  async findByEmail(email: string): Promise<AccountDomainEntity | null> {
    const account = await this.repo.findOne(
      { email },
      { populate: ['roles'] },
    );
    if (!account) return null;
    return AccountDomainMapper.fromPersistence(account);
  }
}
