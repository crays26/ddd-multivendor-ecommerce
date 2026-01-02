import { Module } from '@nestjs/common';
import { AccountEntity } from './infrastructure/entities/account.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthController } from './presentation/controllers/account.controller';
import { AccountRepository } from './infrastructure/repositories/account.repo';
import { RoleEntity } from './infrastructure/entities/role.entity';
import { RoleRepository } from './infrastructure/repositories/role.repo';
import { SignUpAccountCommandHandler } from './application/commands/sign-up-account/handler';
import { LogInAccountCommandHandler } from './application/commands/log-in-account/handler';
import { AuthService } from 'src/shared/auth/auth.service';
import { ShareAuthModule } from 'src/shared/auth/auth.module';
import { CqrsModule } from '@nestjs/cqrs';
import { UnitOfWork } from 'src/shared/ddd/infrastructure/unit-of-work/unit-of-work';
import { UNIT_OF_WORK } from 'src/shared/ddd/infrastructure/unit-of-work/unit-of-work.interface';
import { UnitOfWorkModule } from 'src/shared/ddd/infrastructure/unit-of-work/unit-of-work.module';
import { ACCOUNT_REPO } from './domain/repositories/account.repo.interface';
import { ROLE_REPO } from './domain/repositories/role.repo.interface';
import { AddCustomerRoleEventHandler } from 'src/modules/account/application/event-handlers/add-customer-role.event-handler';
import { AddRoleToAccountCommandHandler } from 'src/modules/account/application/commands/add-role-to-account/handler';
import { AccountReadRepository } from 'src/modules/account/infrastructure/repositories/account.read.repo';
import { GetAccountByIdQuery } from 'src/modules/account/application/queries/get-account-by-id/query';
import { GetAccountByIdQueryHandler } from 'src/modules/account/application/queries/get-account-by-id/handler';
import { AddVendorRoleEventHandler } from 'src/modules/account/application/event-handlers/add-vendor-role.event-handler';
import { AccountPublicService } from 'src/modules/account/application/public-services/account.public-service';
import { AddressEntity } from './infrastructure/entities/address.entity';

const CommandHandlers = [
  SignUpAccountCommandHandler,
  LogInAccountCommandHandler,
  AddRoleToAccountCommandHandler,
];

const QueryHandlers = [GetAccountByIdQueryHandler];

const EventHandlers = [AddCustomerRoleEventHandler, AddVendorRoleEventHandler];
@Module({
  imports: [
    MikroOrmModule.forFeature([AccountEntity, RoleEntity, AddressEntity]),
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
    {
      provide: ROLE_REPO,
      useClass: RoleRepository,
    },
    AccountReadRepository,
    AccountPublicService,
    AuthService,
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    {
      provide: UNIT_OF_WORK,
      useClass: UnitOfWork,
    },
  ],
  exports: [AccountPublicService],
})
export class AccountModule {}
