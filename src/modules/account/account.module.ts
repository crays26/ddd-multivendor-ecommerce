import { Module, OnModuleInit } from '@nestjs/common';
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
import { AddRoleToAccountCommandHandler } from 'src/modules/account/application/commands/add-role-to-account/handler';
import { GetAccountByIdQueryHandler } from 'src/modules/account/application/queries/get-account-by-id/handler';
import { AccountPublicService } from 'src/modules/account/application/public-services/account.public-service';
import { AddressEntity } from './infrastructure/entities/address.entity';
import { AddAddressToAccountCommandHandler } from 'src/modules/account/application/commands/add-address-to-account/handler';
import { EventQueueRegistry } from 'src/shared/ddd/infrastructure/queue/event-queue.registry';
import { EVENT_NAMES } from 'src/shared/ddd/infrastructure/queue/constants/event-names';
import { QUEUE_NAMES } from 'src/shared/ddd/infrastructure/queue/constants/queue-names';

const CommandHandlers = [
  SignUpAccountCommandHandler,
  LogInAccountCommandHandler,
  AddRoleToAccountCommandHandler,
  AddAddressToAccountCommandHandler,
];

const QueryHandlers = [GetAccountByIdQueryHandler];

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
    AccountPublicService,
    AuthService,
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: UNIT_OF_WORK,
      useClass: UnitOfWork,
    },
  ],
  exports: [AccountPublicService],
})
export class AccountModule implements OnModuleInit {
  constructor(private readonly eventRegistry: EventQueueRegistry) {}

  onModuleInit() {
    this.eventRegistry.subscribe(
      EVENT_NAMES.ACCOUNT_SIGNED_UP,
      QUEUE_NAMES.ACCOUNT_QUEUE,
    );
    this.eventRegistry.subscribe(
      EVENT_NAMES.ACCOUNT_SIGNED_UP,
      QUEUE_NAMES.PAYMENT_QUEUE,
    );
    this.eventRegistry.subscribe(
      EVENT_NAMES.ACCOUNT_LOGGED_IN,
      QUEUE_NAMES.ACCOUNT_QUEUE,
    );
  }
}
