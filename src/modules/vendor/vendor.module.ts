import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { VendorEntity } from './infrastructure/entities/vendor.entity';
import { VendorRepository } from './infrastructure/repositories/vendor.repo';
import { VendorReadRepository } from 'src/modules/vendor/infrastructure/repositories/vendor.read.repo';
import { CreateVendorCommandHandler } from 'src/modules/vendor/application/commands/create-vendor/handler';
import { GetVendorByAccountIdQueryHandler } from 'src/modules/vendor/application/queries/get-vendor-by-account-id/handler';
import { VendorController } from 'src/modules/vendor/presentation/controllers/vendor.controller';
import { AccountModule } from 'src/modules/account/account.module';
import { VENDOR_PUBLIC_SERVICE } from './application/public-services/vendor.public-service.interface';
import { VendorPublicService } from './application/public-services/vendor.public-service';

const CommandHandlers = [CreateVendorCommandHandler];
const QueryHandlers = [GetVendorByAccountIdQueryHandler];

@Module({
  imports: [
    MikroOrmModule.forFeature([VendorEntity]),
    CqrsModule,
    AccountModule,
  ],

  controllers: [VendorController],
  providers: [
    {
      provide: VENDOR_PUBLIC_SERVICE,
      useClass: VendorPublicService,
    },
    VendorRepository,
    VendorReadRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [VENDOR_PUBLIC_SERVICE],
})
export class VendorModule {}
