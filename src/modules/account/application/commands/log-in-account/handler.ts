import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogInAccountCommand } from './command';
import { AccountRepository } from 'src/modules/account/infrastructure/repositories/account.repo';
import { AccountDomainEntity } from 'src/modules/account/domain/aggregate-root/account';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/shared/auth/auth.service';
import { AccountDomainMapper } from 'src/modules/account/infrastructure/mappers/account.mapper';
import { AuthPayload } from 'src/shared/auth/AuthPayload.interface';

@CommandHandler(LogInAccountCommand)
export class LogInAccountCommandHandler
  implements ICommandHandler<LogInAccountCommand>
{
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly authService: AuthService,
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
