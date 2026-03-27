import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { CartEntity } from './infrastructure/entities/cart.entity';
import { CartItemEntity } from './infrastructure/entities/cart-item.entity';
import { CartRepository } from './infrastructure/repositories/cart.repo';
import { CART_REPO } from './domain/repositories/cart.repo.interface';
import { GetCartSummaryQueryHandler } from './application/queries/get-cart-summary/handler';
import { CartController } from './presentation/controllers/cart.controller';
import { AddItemToCartCommandHandler } from './application/commands/add-item-to-cart/handler';
import { MergeGuestCartCommandHandler } from './application/commands/merge-guest-cart/handler';

const CommandHandlers = [
  AddItemToCartCommandHandler,
  MergeGuestCartCommandHandler,
];
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
