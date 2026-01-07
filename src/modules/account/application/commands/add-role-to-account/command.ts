import { Command } from '@nestjs/cqrs';
import { RoleName } from 'src/shared/auth/types/role.type';

export class AddRoleToAccountCommand extends Command<string> {
  constructor(
    public readonly accountId: string,
    public readonly roleName: RoleName,
  ) {
    super();
  }
}
