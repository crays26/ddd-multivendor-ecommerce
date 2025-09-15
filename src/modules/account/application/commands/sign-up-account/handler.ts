import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignUpAccountCommand } from './command';
import { AccountDomainEntity } from 'src/modules/account/domain/aggregate-root/account';
import { AuthService } from 'src/shared/auth/auth.service';
import { ConflictException, Inject } from '@nestjs/common';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/shared/ddd/infrastructure/unitOfWork/unit-of-work.interface';
import {
  ACCOUNT_REPO,
  IAccountRepository,
} from 'src/modules/account/domain/repositories/account.repo.interface';
import { AccountRepository } from 'src/modules/account/infrastructure/repositories/account.repo';

@CommandHandler(SignUpAccountCommand)
export class SignUpAccountCommandHandler
  implements ICommandHandler<SignUpAccountCommand>
{
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    // @Inject(ACCOUNT_REPO)
    // private readonly accountRepo: IAccountRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(command: SignUpAccountCommand) {
    await this.unitOfWork.begin();
    const accountRepo = this.unitOfWork.getRepository(AccountRepository);
    try {
      const accountExists = await accountRepo.findByEmail(command.data.email);
      if (accountExists)
        throw new ConflictException('This email has already been used');

      const accountDomainEntity = AccountDomainEntity.create(command.data);
      const hashedPassword = await this.authService.hash(
        accountDomainEntity.getPassword(),
      );
      accountDomainEntity.setPassword(hashedPassword);
      await accountRepo.save(accountDomainEntity);
      await this.unitOfWork.commit();

      return `Account with id ${accountDomainEntity.getId()} registered successfully`;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }

    
  }
}
