import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignUpAccountCommand } from './command';
import { AccountRepository } from 'src/modules/account/infrastructure/repositories/account.repo';
import { AccountDomainEntity } from 'src/modules/account/domain/aggregate-root/account';
import { AuthService } from 'src/shared/auth/auth.service';
import { AccountDomainMapper } from 'src/modules/account/infrastructure/mappers/account.mapper';
import { ConflictException } from '@nestjs/common';

@CommandHandler(SignUpAccountCommand)
export class SignUpAccountCommandHandler
  implements ICommandHandler<SignUpAccountCommand>
{
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(command: SignUpAccountCommand) {
    const accountExists = await this.accountRepo.findByEmail(command.data.email);
    if (accountExists) throw new ConflictException("This email has already been used");

    const accountDomainEntity = AccountDomainEntity.create(command.data);
    const hashedPassword = await this.authService.hash(
      accountDomainEntity.getPassword(),
    );
    accountDomainEntity.setPassword(hashedPassword);
    

    const newAccount = await this.accountRepo.save(accountDomainEntity);
    return "Account registered successfully";
  }
}
