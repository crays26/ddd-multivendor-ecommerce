import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { MergeGuestCartCommand } from './command';
import {
  CART_REPO,
  ICartRepository,
} from '../../../domain/repositories/cart.repo.interface';
import { CartAggRoot } from '../../../domain/aggregate-roots/cart.agg-root';
import { CustomerIdVO } from '../../../domain/value-objects/customer-id.vo';
import { CartItem } from '../../../domain/entities/cart-item.entity';
import { Transactional } from '@mikro-orm/core';

@CommandHandler(MergeGuestCartCommand)
export class MergeGuestCartCommandHandler
  implements ICommandHandler<MergeGuestCartCommand>
{
  constructor(
    @Inject(CART_REPO)
    private readonly cartRepo: ICartRepository,
  ) {}

  @Transactional()
  async execute(command: MergeGuestCartCommand): Promise<void> {
    const { customerId, items } = command.payload;

    if (!items || items.length === 0) {
      return;
    }

    let cart = await this.cartRepo.findByCustomerId(customerId);
    if (!cart) {
      cart = CartAggRoot.create({
        customerId: CustomerIdVO.create({ id: customerId }),
      });
      await this.cartRepo.insert(cart);
    }
    for (const sessionItem of items) {
      const newCartItem = CartItem.create({
        productVariantId: sessionItem.productVariantId,
        quantity: sessionItem.quantity,
      });
      cart.addItem(newCartItem);
    }

    await this.cartRepo.update(cart);
  }
}
