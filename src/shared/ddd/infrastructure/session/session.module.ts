import { Inject, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { REDIS_CLIENT, RedisProvider } from '../providers/redis.provider';
import Redis from 'ioredis';

const MAX_AGE_ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

@Module({
  providers: [RedisProvider],
})
export class ShareSessionModule implements NestModule {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  configure(consumer: MiddlewareConsumer) {
    const redisStore = new RedisStore({
      client: this.redisClient,
      prefix: 'session:',
    });

    consumer
      .apply(
        session({
          store: redisStore,
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
