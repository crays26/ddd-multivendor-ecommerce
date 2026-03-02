import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { CartEntity } from './infrastructure/persistences/entities/cart.entity';
import { CartItemEntity } from './infrastructure/persistences/entities/cart-item.entity';
import { CartRepository } from './infrastructure/persistences/repositories/cart.repo';
import { CART_REPO } from './domain/repositories/cart.repo.interface';
import { GetCartSummaryQueryHandler } from './application/queries/get-cart-summary/handler';
import { CartController } from './presentation/controllers/cart.controller';

const CommandHandlers = [];
const QueryHandlers = [GetCartSummaryQueryHandler];

@Module({
  imports: [
    MikroOrmModule.forFeature([CartEntity, CartItemEntity]),
    CqrsModule,
  ],
  controllers: [CartController],
  providers: [
    {
      provide: CART_REPO,
      useClass: CartRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [CART_REPO],
})
export class CartModule {}
