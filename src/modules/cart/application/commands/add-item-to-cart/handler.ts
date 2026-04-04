import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { AddItemToCartCommand } from './command';
import {
  CART_REPO,
  ICartRepository,
} from '../../../domain/repositories/cart.repo.interface';
import { CartAggRoot } from '../../../domain/aggregate-roots/cart.agg-root';
import { CartItem } from '../../../domain/entities/cart-item.entity';
import { CustomerIdVO } from '../../../domain/value-objects/customer-id.vo';
import { v7 as uuidV7 } from 'uuid';
import { Transactional } from '@mikro-orm/core';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

const GUEST_CART_TTL = 7 * 24 * 60 * 60 * 1000;

@CommandHandler(AddItemToCartCommand)
export class AddItemToCartCommandHandler
  implements ICommandHandler<AddItemToCartCommand>
{
  constructor(
    @Inject(CART_REPO)
    private readonly cartRepo: ICartRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Transactional()
  async execute(command: AddItemToCartCommand): Promise<void | string> {
    const { productVariantId, quantity, customerId, guestCartSessionId } =
      command.payload;

    if (customerId) {
      let cart = await this.cartRepo.findByCustomerId(customerId);

      if (!cart) {
        cart = CartAggRoot.create({
          customerId: CustomerIdVO.create({ id: customerId }),
        });
        await this.cartRepo.insert(cart);
      }

      const cartItem = CartItem.create({
        id: uuidV7(),
        productVariantId: productVariantId,
        quantity,
      });

      cart.addItem(cartItem);

      return await this.cartRepo.update(cart);
    }

    const sessionId = guestCartSessionId || uuidV7();
    let sessionCart = await this.cacheManager.get<
      { productVariantId: string; quantity: number }[]
    >(`guest-cart:${sessionId}`);
    sessionCart = sessionCart || [];

    const existingItem = sessionCart.find(
      (item) => item.productVariantId === productVariantId,
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      sessionCart.push({ productVariantId, quantity });
    }

    await this.cacheManager.set(
      `guest-cart:${sessionId}`,
      sessionCart,
      GUEST_CART_TTL,
    );
    return sessionId;
  }
}
