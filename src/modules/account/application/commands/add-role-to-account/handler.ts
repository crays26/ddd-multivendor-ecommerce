import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddRoleToAccountCommand } from 'src/modules/account/application/commands/add-role-to-account/command';
import { AccountRepository } from 'src/modules/account/infrastructure/repositories/account.repo';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/shared/ddd/infrastructure/unit-of-work/unit-of-work.interface';
import { Inject, NotFoundException } from '@nestjs/common';
import { RoleIdVO } from 'src/modules/account/domain/value-objects/role-id.vo';

@CommandHandler(AddRoleToAccountCommand)
export class AddRoleToAccountCommandHandler
  implements ICommandHandler<AddRoleToAccountCommand>
{
  constructor(
    private readonly accountRepository: AccountRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: AddRoleToAccountCommand): Promise<string> {
    await this.uow.begin();
    try {
      const accountAggRoot = await this.accountRepository.findById(
        command.accountId,
      );
      if (!accountAggRoot)
        throw new NotFoundException(
          `Account with id ${command.accountId} not found`,
        );
      accountAggRoot.addRole(RoleIdVO.create({ id: command.roleId }));
      await this.accountRepository.save(accountAggRoot);
      return `${command.roleId} added successfully`;
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }
  }
}
