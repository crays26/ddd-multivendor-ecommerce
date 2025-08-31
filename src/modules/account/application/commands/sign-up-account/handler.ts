import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SignUpAccountCommand } from './command';
import { AccountDomainEntity } from 'src/modules/account/domain/aggregate-root/account';
import { AuthService } from 'src/shared/auth/auth.service';
import { ConflictException, Inject } from '@nestjs/common';
import { IUnitOfWork, UNIT_OF_WORK } from '../../../../../shared/ddd/infrastructure/unitOfWork/unit.of.work.interface';
import { EntityManager } from '@mikro-orm/postgresql';
import { ACCOUNT_REPO, IAccountRepository } from 'src/modules/account/domain/repositories/account.repo.interface';

@CommandHandler(SignUpAccountCommand)
export class SignUpAccountCommandHandler
  implements ICommandHandler<SignUpAccountCommand>
{
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: IUnitOfWork,
    @Inject(ACCOUNT_REPO)
    private readonly accountRepo: IAccountRepository,
    private readonly authService: AuthService,
    private readonly em: EntityManager,
  ) {}

  async execute(command: SignUpAccountCommand) {
    const accountExists = await this.accountRepo.findByEmail(command.data.email);
    if (accountExists) throw new ConflictException("This email has already been used");

    const accountDomainEntity = AccountDomainEntity.create(command.data);
    const hashedPassword = await this.authService.hash(
      accountDomainEntity.getPassword(),
    );
    accountDomainEntity.setPassword(hashedPassword);
    
    await this.unitOfWork.begin();
    try {
      await this.accountRepo.save(accountDomainEntity);
      await this.unitOfWork.commit();
    }
    catch(error) {
      await this.unitOfWork.rollback();
    }
    
    return "Account registered successfully";
  }
}
