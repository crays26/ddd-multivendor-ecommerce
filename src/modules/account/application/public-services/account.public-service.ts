import { Injectable } from '@nestjs/common';

import { RoleName } from 'src/shared/auth/types/role.type';

import { CommandBus } from '@nestjs/cqrs';
import { AddRoleToAccountCommand } from 'src/modules/account/application/commands/add-role-to-account/command';

@Injectable()
export class AccountPublicService {
  constructor(private readonly commandBus: CommandBus) {}

  async assignRole(accountId: string, roleName: RoleName): Promise<string> {
    return await this.commandBus.execute(
      new AddRoleToAccountCommand(accountId, roleName),
    );
  }
}
