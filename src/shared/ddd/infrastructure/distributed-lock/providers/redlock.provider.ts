import { Provider } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.provider';
import Redis from 'ioredis';
import Redlock from 'redlock';

export const RED_LOCK = Symbol('DISTRIBUTED_LOCK');

export const RedlockProvider: Provider = {
  provide: RED_LOCK,
  useFactory: (redisClient: Redis) => {
    return new Redlock([redisClient], {
      retryCount: 3,
      retryDelay: 200,
      retryJitter: 100,
    });
  },
  inject: [REDIS_CLIENT],
};
