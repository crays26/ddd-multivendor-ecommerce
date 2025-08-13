import {
  AccountDto,
  RoleDto,
} from '../../presentation/dtos/response/account.response.dto';
import { AccountDomainEntity } from '../../domain/aggregate-root/account';
import { plainToInstance } from 'class-transformer';

export class AccountDtoMapper {

  static fromDomain(account: AccountDomainEntity): AccountDto {
    return plainToInstance(AccountDto, {
      id: account.getId(),
      username: account.getUsername(),
      email: account.getEmail(),
      roles: account.getRoles().map((role) =>
        plainToInstance(RoleDto, {
          id: role.getId(),
          name: role.getName(),
        }),
      ),
    });
  }
}
