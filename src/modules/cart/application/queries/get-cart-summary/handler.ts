import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCartSummaryQuery } from './query';
import { CartItemSummaryDto, CartSummaryDto } from './dto';
import { EntityRepository } from '@mikro-orm/postgresql';
import { CartEntity } from '../../../infrastructure/persistences/entities/cart.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { plainToClass } from 'class-transformer';

@QueryHandler(GetCartSummaryQuery)
export class GetCartSummaryQueryHandler
  implements IQueryHandler<GetCartSummaryQuery>
{
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepo: EntityRepository<CartEntity>,
  ) {}

  async execute(query: GetCartSummaryQuery): Promise<CartSummaryDto> {
    const cart = await this.cartRepo.findOne(
      { customer: { id: query.customerId } },
      { populate: ['items.productVariant'] },
    );

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    const cartItems = cart.items.getItems();

    const outOfStockItems = cartItems.filter(
      (item) => item.productVariant.stock < item.quantity,
    );
    if (outOfStockItems.length > 0) {
      throw new ConflictException(
        outOfStockItems.map(
          (item) =>
            `Not enough stock for ${item.productVariant.name} (available: ${item.productVariant.stock}, requested: ${item.quantity})`,
        ),
      );
    }

    const items = cartItems.map((item) =>
      plainToClass(CartItemSummaryDto, {
        variantId: item.productVariant.id,
        variantName: item.productVariant.name,
        skuCode: item.productVariant.skuCode,
        price: item.productVariant.price,
        quantity: item.quantity,
        lineTotal: item.productVariant.price * item.quantity,
      }),
    );

    return plainToClass(CartSummaryDto, {
      cartId: cart.id,
      items,
      totalAmount: items.reduce((sum, item) => sum + item.lineTotal, 0),
      itemCount: items.length,
    });
  }
}
