import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { VendorEntity } from './infrastructure/entities/vendor.entity';
import { VendorRepository } from './infrastructure/repositories/vendor.repo';

const CommandHandlers = []
const QueryHandlers = []

@Module({
  imports: [
    MikroOrmModule.forFeature([VendorEntity]),
    CqrsModule,
  ],

  controllers: [],
  providers: [
    VendorRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [],
})
export class VendorModule {}
