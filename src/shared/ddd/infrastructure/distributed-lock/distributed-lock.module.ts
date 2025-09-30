import { Global, Module } from '@nestjs/common';
import { RedisProvider } from './providers/redis.provider';
import { RedlockProvider } from './providers/redlock.provider';
import { RedLockService } from './redlock.service';

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
export class ShareDistributedLockModule {}
