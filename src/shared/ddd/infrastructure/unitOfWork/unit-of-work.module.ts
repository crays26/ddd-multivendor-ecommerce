import { Module } from '@nestjs/common';
import { UNIT_OF_WORK } from './unit-of-work.interface';
import { UnitOfWork } from './unit-of-work';

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: UNIT_OF_WORK,
      useClass: UnitOfWork,
    },
  ],
  exports: [ UNIT_OF_WORK ],
})
export class UnitOfWorkModule {}
