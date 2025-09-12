import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          stores: [
            new KeyvRedis(process.env.REDIS_CONNECTION_URL as string),
          ],
        };
      },
    }),
  ],
  
  exports: [NestCacheModule]
  
})
export class ShareCacheModule {}
