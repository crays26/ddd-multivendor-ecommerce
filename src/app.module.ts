import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroConfig from './shared/infrastructure/database/mikro-orm.config';
import { AccountModule } from './modules/account/account.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ShareAuthModule } from './shared/auth/auth.module';

@Module({

  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroOrmModule.forRoot(mikroConfig),
    AccountModule,
    ShareAuthModule
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
