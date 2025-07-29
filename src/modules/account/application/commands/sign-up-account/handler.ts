import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignUpAccountCommand } from './command';
import { AccountRepository } from 'src/modules/account/infrastructure/repositories/account.repo';
import { AccountDomainEntity } from 'src/modules/account/domain/aggregate-root/account';

@CommandHandler(SignUpAccountCommand)
export class SignUpAccountCommandHandler implements ICommandHandler<SignUpAccountCommand>
{
  constructor(private accountRepo: AccountRepository) {}
  
  async execute(command: SignUpAccountCommand) {
    const accountDomainEntity = AccountDomainEntity.create(command);
    const newAccount = await this.accountRepo.create(accountDomainEntity);
    return newAccount;
  }
}
