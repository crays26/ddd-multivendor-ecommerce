import { Global, Module } from '@nestjs/common';
import { RedisProvider } from './providers/redis.provider';
import { RED_LOCK, RedlockProvider } from './providers/redlock.provider';
import { RedLockService } from './distributed-lock.service';

export const DISTRIBUTED_LOCK = Symbol('DISTRIBUTED_LOCK');
@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    RedisProvider,
    RedlockProvider,
    {
      provide: DISTRIBUTED_LOCK,
      useClass: RedLockService,
    },
  ],
  exports: [DISTRIBUTED_LOCK],
})
export class UnitOfWorkModule {}
