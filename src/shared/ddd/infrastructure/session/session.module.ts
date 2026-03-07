import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import * as session from 'express-session';
import connectRedis from 'connect-redis';
import { REDIS_CLIENT, RedisProvider } from '../providers/redis.provider';
import Redis from 'ioredis';

const MAX_AGE_ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

@Module({
  providers: [RedisProvider],
})
export class ShareSessionModule implements NestModule {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  configure(consumer: MiddlewareConsumer) {
    const RedisStore = connectRedis(session);

    consumer
      .apply(
        session({
          store: new RedisStore({ client: this.redisClient }),
          secret: process.env.SESSION_SECRET_KEY!,
          resave: false,
          saveUninitialized: false,
          cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: MAX_AGE_ONE_WEEK,
          },
        }),
      )
      .forRoutes('*');
  }
}
