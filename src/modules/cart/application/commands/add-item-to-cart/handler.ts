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

@CommandHandler(AddItemToCartCommand)
export class AddItemToCartCommandHandler
  implements ICommandHandler<AddItemToCartCommand>
{
  constructor(
    @Inject(CART_REPO)
    private readonly cartRepo: ICartRepository,
  ) {}

  @Transactional()
  async execute(command: AddItemToCartCommand): Promise<void> {
    const { productVariantId, quantity, customerId } = command.payload;

    if (!customerId) {
      throw new BadRequestException(
        'customerId is required for DB cart operations',
      );
    }

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

    await this.cartRepo.update(cart);
  }
}
