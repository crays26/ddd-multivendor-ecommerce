import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroConfig from './shared/infrastructure/database/mikro-orm.config';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  // ConfigModule.forRoot({
  //     isGlobal: true,
  //   }),
  imports: [
    MikroOrmModule.forRoot(mikroConfig),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
