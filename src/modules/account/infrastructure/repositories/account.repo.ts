// account.repository.ts
import { InjectRepository } from '@mikro-orm/nestjs';
import { assign, EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/postgresql';
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
    const existing = await this.repo.findOne(
      { id: domain.getId() },
      { populate: ['roles'] },
    );
    const roles = existing?.roles.getItems();
    roles?.forEach(r => {
      r.name = "kiki"
    })

    if (!existing) {
      // New account
      const account = new Account();
      account.id = domain.getId();
      account.username = domain.getUsername();
      account.email = domain.getEmail();
      account.password = domain.getPassword();
      

      const roles = domain.getRoles().map(
        (r) => this.em.getReference(Role, r.getId()), // avoids duplicate insert
      );
      account.roles.add([...roles]);

      return await this.em.persistAndFlush(account);
      
    }

    // Update existing account
    wrap(existing).assign({
      username: domain.getUsername(),
      email: domain.getEmail(),
      password: domain.getPassword(),
      roles: domain
        .getRoles()
        .map((r) => this.em.getReference(Role, r.getId())),
    });

    return await this.em.flush();
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

  async findById(id: string): Promise<AccountDomainEntity> {
    const account = await this.repo.findOneOrFail(
      { id },
      { populate: ['roles'] },
    );

    return AccountDomainMapper.fromPersistence(account);
  }

  async findByEmail(email: string): Promise<AccountDomainEntity | null> {
    const account = await this.repo.findOneOrFail(
      { email },
      { populate: ['roles'] },
    );
    return AccountDomainMapper.fromPersistence(account);
  }
}
