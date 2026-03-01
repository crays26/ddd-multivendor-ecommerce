import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignUpAccountCommand } from './command';
import { AccountAggRoot } from 'src/modules/account/domain/aggregate-root/account.agg-root';
import { AuthService } from 'src/shared/auth/auth.service';
import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { Transactional } from '@mikro-orm/core';
import {
  ACCOUNT_REPO,
  IAccountRepository,
} from 'src/modules/account/domain/repositories/account.repo.interface';
import {
  ROLE_REPO,
  IRoleRepository,
} from 'src/modules/account/domain/repositories/role.repo.interface';
import { RoleName } from 'src/shared/auth/types/role.type';
import { RoleIdVO } from 'src/modules/account/domain/value-objects/role-id.vo';

@CommandHandler(SignUpAccountCommand)
export class SignUpAccountCommandHandler
  implements ICommandHandler<SignUpAccountCommand>
{
  constructor(
    @Inject(ACCOUNT_REPO)
    private readonly accountRepo: IAccountRepository,
    @Inject(ROLE_REPO)
    private readonly roleRepo: IRoleRepository,
    private readonly authService: AuthService,
  ) {}

  @Transactional()
  async execute(command: SignUpAccountCommand) {
    const accountExists = await this.accountRepo.findByEmail(
      command.data.email,
    );
    if (accountExists)
      throw new ConflictException('This email has already been used');

    const accountDomainEntity = AccountAggRoot.create(command.data);

    const hashedPassword = await this.authService.hash(
      accountDomainEntity.getPassword(),
    );
    accountDomainEntity.setPassword(hashedPassword);

    const role = await this.roleRepo.findByName(RoleName.CUSTOMER);
    if (!role) throw new NotFoundException('Role not found');

    accountDomainEntity.addRole(RoleIdVO.create({ id: role.getId() }));

    await this.accountRepo.insert(accountDomainEntity);

    // Save AccountSignedUpEvent to outbox
    // const signedUpEvent = new AccountSignedUpEvent(
    //   accountDomainEntity.getId(),
    //   command.data.email,
    // );

    // await this.outboxRepository.save({
    //   id: uuidV7(),
    //   name: signedUpEvent.constructor.name,
    //   payload: signedUpEvent,
    //   status: Status.PENDING,
    //   createdAt: new Date(),
    // });

    return accountDomainEntity.getId();
  }
}
