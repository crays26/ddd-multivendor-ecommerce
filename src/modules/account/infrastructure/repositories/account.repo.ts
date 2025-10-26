import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Account } from '../entities/account.entity';
import { AccountAggRoot } from '../../domain/aggregate-root/account.agg-root';
import { IAccountRepository } from '../../domain/repositories/account.repo.interface';
import { AccountDomainMapper } from '../mappers/account.mapper';
import { Role } from '../entities/role.entity';

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    private readonly em: EntityManager,
    // @InjectRepository(Account)
    // private readonly accountRepo: EntityRepository<Account>,
    // @InjectRepository(Role)
    // private readonly roleRepo: EntityRepository<Role>,
  ) {}

  async insert(domain: AccountAggRoot) {
    const account = new Account();
    account.id = domain.getId();

    account.username = domain.getUsername();
    account.email = domain.getEmail();
    account.password = domain.getPassword();
    account.roles.set(
      domain.getRoles().map((r) => this.em.getReference(Role, r.getId())),
    );

    this.em.persist(account);
  }

  async update(domain: AccountAggRoot): Promise<void> {
    const account: Account = await this.em.findOneOrFail(
      Account,
      {
        id: domain.getId(),
      },
      { populate: ['roles'] },
    );

    account.username = domain.getUsername();
    account.email = domain.getEmail();
    account.password = domain.getPassword();
    account.roles.set(
      domain.getRoles().map((r) => this.em.getReference(Role, r.getId())),
    );

    this.em.persist(account);
  }

  // async create(domain: AccountDomainEntity) {
  //   const account = new Account();
  //   account.id = domain.getId();
  //   account.username = domain.getUsername();
  //   account.email = domain.getEmail();
  //   account.password = domain.getPassword();

  //   await this.em.persistAndFlush(account);

  //   return account;
  // }

  async findById(id: string): Promise<AccountAggRoot | null> {
    const account = await this.em.findOne(
      Account,
      { id },
      { populate: ['roles'] },
    );
    if (!account) return null;
    return AccountDomainMapper.fromPersistence(account);
  }

  async findByEmail(email: string): Promise<AccountAggRoot | null> {
    const account = await this.em.findOne(
      Account,
      { email },
      { populate: ['roles'] },
    );
    if (!account) return null;
    return AccountDomainMapper.fromPersistence(account);
  }
}
