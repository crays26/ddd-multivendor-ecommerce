import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { AuthService } from 'src/shared/auth/auth.service';
import { ShareAuthModule } from 'src/shared/auth/auth.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    
  ],

  controllers: [],
//   providers: [AccountRepository, AuthService, ...CommandHandlers],
  exports: [],
})
export class CustomerModule {}
