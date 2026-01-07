import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddRoleToAccountCommand } from 'src/modules/account/application/commands/add-role-to-account/command';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  ACCOUNT_REPO,
  IAccountRepository,
} from 'src/modules/account/domain/repositories/account.repo.interface';
import {
  ROLE_REPO,
  IRoleRepository,
} from 'src/modules/account/domain/repositories/role.repo.interface';
import { RoleIdVO } from 'src/modules/account/domain/value-objects/role-id.vo';

@CommandHandler(AddRoleToAccountCommand)
export class AddRoleToAccountCommandHandler
  implements ICommandHandler<AddRoleToAccountCommand>
{
  constructor(
    @Inject(ACCOUNT_REPO)
    private readonly accountRepository: IAccountRepository,
    @Inject(ROLE_REPO)
    private readonly roleRepository: IRoleRepository,
  ) {}

  async execute(command: AddRoleToAccountCommand): Promise<string> {
    const { accountId, roleName } = command;

    const accountAggRoot = await this.accountRepository.findById(accountId);
    if (!accountAggRoot)
      throw new NotFoundException(`Account with id ${accountId} not found`);

    const role = await this.roleRepository.findByName(roleName);
    if (!role)
      throw new NotFoundException(`Role with name ${roleName} not found`);

    accountAggRoot.addRole(RoleIdVO.create({ id: role.getId() }));
    await this.accountRepository.update(accountAggRoot);

    return accountAggRoot.getId();
  }
}
