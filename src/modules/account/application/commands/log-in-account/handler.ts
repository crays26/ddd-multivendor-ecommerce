import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { LogInAccountCommand } from './command';
import { IAccountRepository } from "src/modules/account/domain/repositories/account.repo.interface";
import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/shared/auth/auth.service';
import { AuthPayload } from 'src/shared/auth/types/auth-payload.type';
import { ACCOUNT_REPO } from 'src/modules/account/domain/repositories/account.repo.interface';
import { JwtTokenPair } from 'src/shared/auth/types/jwt-token-pair.type';
import {IRoleRepository, ROLE_REPO} from "src/modules/account/domain/repositories/role.repo.interface";
import { RoleName } from 'src/shared/auth/types/role.type';

@CommandHandler(LogInAccountCommand)
export class LogInAccountCommandHandler
  implements ICommandHandler<LogInAccountCommand>
{
  constructor(
    @Inject(ACCOUNT_REPO)
    private readonly accountRepo: IAccountRepository,
    @Inject(ROLE_REPO)
    private readonly roleRepo: IRoleRepository,
    private readonly authService: AuthService,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: LogInAccountCommand): Promise<JwtTokenPair> {
    const { email, password } = command.data;
    const accountDomain = await this.accountRepo.findByEmail(email);
    if (!accountDomain) throw new NotFoundException('Account does not exist');

    const isPasswordValid = await bcrypt.compare(
      password,
      accountDomain.getPassword(),
    );
    if (!isPasswordValid)
      throw new ConflictException('Password does not match');

    const accountWithContext =
      this.eventPublisher.mergeObjectContext(accountDomain);
    accountWithContext.logIn();
    accountWithContext.commit();

    const roleIds = accountDomain.getRoles().map((role) => role.getId());
    const roles = await this.roleRepo.findByIds(roleIds);
    const roleNames: RoleName[] = roles.map((r) => r.getName());

    const tokenPayload: AuthPayload = {
      id: accountDomain.getId(),
      username: accountDomain.getUsername(),
      email: accountDomain.getEmail(),
      roles: roleNames,
    };
    return this.authService.generateTokens(tokenPayload);
  }
}
