import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { VendorEntity } from './infrastructure/entities/vendor.entity';
import { VendorRepository } from './infrastructure/repositories/vendor.repo';
import { VendorReadRepository } from 'src/modules/vendor/infrastructure/repositories/vendor.read.repo';
import { CreateVendorCommandHandler } from 'src/modules/vendor/application/commands/create-vendor/handler';
import { GetVendorByAccountIdQueryHandler } from 'src/modules/vendor/application/queries/get-vendor-by-account-id/handler';

const CommandHandlers = [CreateVendorCommandHandler];
const QueryHandlers = [GetVendorByAccountIdQueryHandler];

@Module({
  imports: [MikroOrmModule.forFeature([VendorEntity]), CqrsModule],

  controllers: [],
  providers: [
    VendorRepository,
    VendorReadRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [],
})
export class VendorModule {}
