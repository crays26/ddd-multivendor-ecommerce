import { Module } from '@nestjs/common';
import { Account } from './infrastructure/entities/account.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthController } from './presentation/controllers/account.controller';
import { AccountRepository } from './infrastructure/repositories/account.repo';
import { EntityManager } from '@mikro-orm/postgresql';
import { Book } from './infrastructure/entities/book.entity';
@Module({
  imports: [MikroOrmModule.forFeature([Account, Book])],

  controllers: [AuthController],
  providers: [
       AccountRepository,
    ],
  exports: [],
})
export class AuthModule {}
