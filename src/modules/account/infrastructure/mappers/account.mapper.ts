import { AccountEntity } from '../entities/account.entity';
import { AccountAggRoot } from '../../domain/aggregate-root/account.agg-root';
import { RoleIdVO } from 'src/modules/account/domain/value-objects/role-id.vo';
import { PasswordVO } from '../../domain/value-objects/password.vo';
import { EmailVO } from '../../domain/value-objects/email.vo';
import { RoleEntity } from '../entities/role.entity';
import { Collection } from '@mikro-orm/core';
import { Address } from '../../domain/entities/address.entity';
import { AddressEntity } from '../entities/address.entity';

export class AccountDomainMapper {
  static fromPersistence(accountEntity: AccountEntity): AccountAggRoot {
    
    return AccountAggRoot.rehydrate({
      ...accountEntity,
      password: PasswordVO.create({ value: accountEntity.password }),
      email: EmailVO.create({ value: accountEntity.email }),
      roles: accountEntity.roles.map((r) =>
        RoleIdVO.create({ id: r.id, name: r.name }),
      ),
      addresses: accountEntity.addresses.map((a) =>
        Address.create({
          id: a.id,
          fullName: a.fullName,
          phoneNumber: a.phoneNumber,
          street: a.street,
          unit: a.unit,
          ward: a.ward,
          city: a.city,
          region: a.region,
          postalCode: a.postalCode,
          countryCode: a.countryCode,
          isDefault: a.isDefault,
          label: a.label,
        }),
      ),
    });
  }

  static toPersistence(domain: AccountAggRoot): AccountEntity {
    const account = new AccountEntity();
    account.id = domain.getId();
    account.username = domain.getUsername();
    account.email = domain.getEmail();
    account.password = domain.getPassword();

    const roles = domain.getRoles().map((r) => {
      const role = new RoleEntity();
      role.id = r.getId();
      role.name = r.getName() ?? role.name;
      return role;
    });

    account.roles = new Collection<RoleEntity>(account, roles);

    return account;
  }
}
