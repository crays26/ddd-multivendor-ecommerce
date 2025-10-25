import { Module } from '@nestjs/common';
import { Account } from './infrastructure/entities/account.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthController } from './presentation/controllers/account.controller';
import { AccountRepository } from './infrastructure/repositories/account.repo';
import { Role } from './infrastructure/entities/role.entity';
import { SignUpAccountCommandHandler } from './application/commands/sign-up-account/handler';
import { LogInAccountCommandHandler } from './application/commands/log-in-account/handler';
import { AuthService } from 'src/shared/auth/auth.service';
import { ShareAuthModule } from 'src/shared/auth/auth.module';
import { CqrsModule } from '@nestjs/cqrs';
import { GetAccountOfCurrentUserQueryHandler } from './application/queries/get-account-of-current-user/handler';
import { UnitOfWork } from 'src/shared/ddd/infrastructure/unit-of-work/unit-of-work';
import { UNIT_OF_WORK } from 'src/shared/ddd/infrastructure/unit-of-work/unit-of-work.interface';
import { UnitOfWorkModule } from 'src/shared/ddd/infrastructure/unit-of-work/unit-of-work.module';
import { ACCOUNT_REPO } from './domain/repositories/account.repo.interface';
import { AddCustomerRoleEventHandler } from 'src/modules/account/application/event-handlers/add-customer-role.event-handler';
import { AddRoleToAccountCommandHandler } from 'src/modules/account/application/commands/add-role-to-account/handler';

const CommandHandlers = [
  SignUpAccountCommandHandler,
  LogInAccountCommandHandler,
  AddRoleToAccountCommandHandler,
];

const QueryHandlers = [GetAccountOfCurrentUserQueryHandler];

const EventHandlers = [AddCustomerRoleEventHandler];
@Module({
  imports: [
    MikroOrmModule.forFeature([Account, Role]),
    ShareAuthModule,
    CqrsModule,
    UnitOfWorkModule,
  ],

  controllers: [AuthController],
  providers: [
    {
      provide: ACCOUNT_REPO,
      useClass: AccountRepository,
    },
    AuthService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    {
      provide: UNIT_OF_WORK,
      useClass: UnitOfWork,
    },
  ],
  exports: [],
})
export class AccountModule {}
