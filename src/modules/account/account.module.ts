import { Module } from '@nestjs/common';
import { Account } from './infrastructure/entities/account.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthController } from './presentation/controllers/account.controller';
import { AccountRepository } from './infrastructure/repositories/account.repo';
import { EntityManager } from '@mikro-orm/postgresql';
import { Role } from './infrastructure/entities/role.entity';
import { SignUpAccountCommandHandler } from './application/commands/sign-up-account/handler';
import { LogInAccountCommandHandler } from './application/commands/log-in-account/handler';
import { AuthService } from 'src/shared/auth/auth.service';
import { ShareAuthModule } from 'src/shared/auth/auth.module';
import { CqrsModule } from '@nestjs/cqrs';
import { GetAccountOfCurrentUserQueryHandler } from './application/queries/get-account-of-current-user/handler';

const CommandHandlers = [
  SignUpAccountCommandHandler,
  LogInAccountCommandHandler,
];

const QueryHandlers = [GetAccountOfCurrentUserQueryHandler];
@Module({
  imports: [
    MikroOrmModule.forFeature([Account, Role]),
    ShareAuthModule,
    CqrsModule,
  ],

  controllers: [AuthController],
  providers: [
    AccountRepository,
    AuthService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [],
})
export class AccountModule {}
