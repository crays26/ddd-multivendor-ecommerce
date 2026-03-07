import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroConfig from './shared/ddd/infrastructure/database/mikro-orm.config';
import { AccountModule } from './modules/account/account.module';
import { ConfigModule } from '@nestjs/config';
import { ShareAuthModule } from './shared/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { VendorModule } from './modules/vendor/vendor.module';
import { ShareCacheModule } from './shared/ddd/infrastructure/cache/cache.module';
import { ShareDistributedLockModule } from './shared/ddd/infrastructure/distributed-lock/distributed-lock.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ShareCloudStorageModule } from 'src/shared/ddd/infrastructure/cloud-storage/cloud-storage.module';
import { ShareOutboxModule } from './shared/ddd/infrastructure/outbox/outbox.module';
import { ShareQueueModule } from './shared/ddd/infrastructure/queue/queue.module';
import { OrderModule } from './modules/order/order.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { BillingModule } from './modules/billing/billing.module';
import { ShareSessionModule } from './shared/ddd/infrastructure/session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroOrmModule.forRoot(mikroConfig),
    CqrsModule.forRoot(),
    AccountModule,
    ProductModule,
    VendorModule,
    OrderModule,
    InventoryModule,
    BillingModule,
    ShareAuthModule,
    ShareCacheModule,
    ShareDistributedLockModule,
    ShareCloudStorageModule,
    ShareOutboxModule,
    ShareQueueModule,
    ShareSessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
