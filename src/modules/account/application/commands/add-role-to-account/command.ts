import { Command } from '@nestjs/cqrs';


export class AddRoleToAccountCommand extends Command<string> {
  constructor(
    public readonly accountId: string,
    public readonly roleId: string,
  ) {
    super();
  }
}
