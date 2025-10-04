import { Account } from '../entities/account.entity';
import { AccountAggRoot } from '../../domain/aggregate-root/account.agg-root';
import { RoleDomainEntity } from '../../domain/entities/role';
import { PasswordVO } from '../../domain/value-objects/password.vo';
import { EmailVO } from '../../domain/value-objects/email.vo';
import { Role } from '../entities/role.entity';
import { Collection } from '@mikro-orm/core';

export class AccountDomainMapper {
  static fromPersistence(accountEntity: Account): AccountAggRoot {
    return AccountAggRoot.rehydrate({
      ...accountEntity,
      password: PasswordVO.create({ value: accountEntity.password }),
      email: EmailVO.create({ value: accountEntity.email }),
      roles: accountEntity.roles.map((r) =>
        RoleDomainEntity.create({ id: r.id, name: r.name }),
      ),
    });
  }

  static toPersistence(domain: AccountAggRoot): Account {
    const account = new Account();
    account.id = domain.getId();
    account.username = domain.getUsername();
    account.email = domain.getEmail();
    account.password = domain.getPassword();
    
    const roles = domain.getRoles().map((r) => {
      const role = new Role();
      role.id = r.getId();
      role.name = r.getName();
      return role;
    });

    account.roles = new Collection<Role>(account, roles);

    return account;
  }
}
