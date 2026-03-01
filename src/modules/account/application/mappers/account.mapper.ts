import {
  AccountDto,
  RoleDto,
} from '../../presentation/dtos/response/account.response.dto';
import { AccountAggRoot } from '../../domain/aggregate-root/account.agg-root';
import { plainToInstance } from 'class-transformer';

export class AccountDtoMapper {
  static fromDomain(account: AccountAggRoot): AccountDto {
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
