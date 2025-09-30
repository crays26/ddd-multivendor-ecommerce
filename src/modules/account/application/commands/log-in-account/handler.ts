import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { LogInAccountCommand } from './command';
import { AccountRepository } from 'src/modules/account/infrastructure/repositories/account.repo';
import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/shared/auth/auth.service';
import { AuthPayload } from 'src/shared/auth/AuthPayload.interface';
import { ACCOUNT_REPO } from 'src/modules/account/domain/repositories/account.repo.interface';

@CommandHandler(LogInAccountCommand)
export class LogInAccountCommandHandler
  implements ICommandHandler<LogInAccountCommand>
{
  constructor(
    @Inject(ACCOUNT_REPO)
    private readonly accountRepo: AccountRepository,
    private readonly authService: AuthService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: LogInAccountCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = command.data;
    const accountDomain = await this.accountRepo.findByEmail(email);
    if (!accountDomain) throw new NotFoundException('Account does not exist');

    const isPasswordValid = await bcrypt.compare(
      password,
      accountDomain.getPassword(),
    );
    if (!isPasswordValid)
      throw new ConflictException('Password does not match');

    const accountWithContext = this.eventPublisher.mergeObjectContext(accountDomain);
    accountWithContext.logIn();
    accountWithContext.commit();

    const tokenPayload: AuthPayload = {
      id: accountDomain.getId(),
      username: accountDomain.getUsername(),
      email: accountDomain.getEmail(),
      roles: accountDomain
        .getRoles()
        .map((role) => ({ id: role.getId(), name: role.getName() })),
    };
    return this.authService.generateTokens(tokenPayload);
  }
}
