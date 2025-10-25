import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { SignUpAccountCommand } from './command';
import { AccountAggRoot } from 'src/modules/account/domain/aggregate-root/account.agg-root';
import { AuthService } from 'src/shared/auth/auth.service';
import { ConflictException, Inject } from '@nestjs/common';
import {
  UNIT_OF_WORK,
  IUnitOfWork,
} from 'src/shared/ddd/infrastructure/unit-of-work/unit-of-work.interface';
import { AccountRepository } from 'src/modules/account/infrastructure/repositories/account.repo';
import { AccountSignedUpEvent } from 'src/modules/account/domain/events/account-signed-up.event';

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
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: SignUpAccountCommand) {
    await this.unitOfWork.begin();
    const accountRepo = this.unitOfWork.getRepository(AccountRepository);
    try {
      const accountExists = await accountRepo.findByEmail(command.data.email);
      if (accountExists)
        throw new ConflictException('This email has already been used');

      const accountDomainEntity =
        AccountAggRoot.create(command.data)

      const hashedPassword = await this.authService.hash(
        accountDomainEntity.getPassword(),
      );
      accountDomainEntity.setPassword(hashedPassword);
      await accountRepo.save(accountDomainEntity);

      await this.unitOfWork.commit();
      this.eventPublisher.mergeObjectContext(accountDomainEntity).commit();
      return `Account with id ${accountDomainEntity.getId()} registered successfully`;
    } catch (error) {
      await this.unitOfWork.rollback();
      throw error;
    }
  }
}
