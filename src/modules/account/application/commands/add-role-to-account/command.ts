import { Command } from '@nestjs/cqrs';
import { Role } from 'src/shared/auth/enums/role.enum';

export class AddRoleToAccountCommand extends Command<string> {
  constructor(
    public readonly accountId: string,
    public readonly roleId: string,
  ) {
    super();
  }
}
