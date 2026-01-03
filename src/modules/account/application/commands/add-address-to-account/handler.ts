import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddAddressToAccountCommand } from './command';
import { Inject, NotFoundException } from '@nestjs/common';
import { Transactional } from '@mikro-orm/core';
import {
  ACCOUNT_REPO,
  IAccountRepository,
} from 'src/modules/account/domain/repositories/account.repo.interface';
import { Address } from 'src/modules/account/domain/entities/address.entity';

@CommandHandler(AddAddressToAccountCommand)
export class AddAddressToAccountCommandHandler
  implements ICommandHandler<AddAddressToAccountCommand>
{
  constructor(
    @Inject(ACCOUNT_REPO)
    private readonly accountRepo: IAccountRepository,
  ) {}

  @Transactional()
  async execute(command: AddAddressToAccountCommand): Promise<string> {
    const { accountId, data } = command;
    const account = await this.accountRepo.findById(accountId);
    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const address = Address.create(data);

    account.addAddress(address);
    await this.accountRepo.update(account);

    return address.getId();
  }
}
