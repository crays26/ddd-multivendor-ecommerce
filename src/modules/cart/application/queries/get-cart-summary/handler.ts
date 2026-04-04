import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCartSummaryQuery } from './query';
import { CartPerVendorSummaryDto, CartSummaryDto } from './dto';
import { EntityRepository } from '@mikro-orm/postgresql';
import { CartEntity } from '../../../infrastructure/entities/cart.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ConflictException, NotFoundException } from '@nestjs/common';

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
      {
        populate: [
          'items.productVariant.inventory',
          'items.productVariant.product.vendor',
        ],
      },
    );

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    const cartItems = cart.items.getItems();

    const outOfStockItems = cartItems.filter(
      (item) => item.productVariant.inventory!.quantity < item.quantity,
    );
    if (outOfStockItems.length > 0) {
      throw new ConflictException(
        outOfStockItems.map(
          (item) =>
            `Not enough stock for ${item.productVariant.name} (available: ${item.productVariant.inventory!.quantity}, requested: ${item.quantity})`,
        ),
      );
    }

    let itemCount = 0;
    let totalAmount = 0;
    const vendorAccumulator = cartItems.reduce(
      (acc, item) => {
        const vendorId = item.productVariant.product.vendor.id;
        if (!acc[vendorId]) {
          acc[vendorId] = {
            vendor: {
              id: vendorId,
              name: item.productVariant.product.vendor.name,
            },
            items: [],
            subtotal: 0,
          };
        }
        acc[vendorId].items.push({
          variantId: item.productVariant.id,
          variantName: item.productVariant.name,
          skuCode: item.productVariant.skuCode,
          price: item.productVariant.price,
          isOutOfStock: item.productVariant.inventory!.quantity < item.quantity,
          quantity: item.quantity,
          lineTotal: item.productVariant.price * item.quantity,
        });
        acc[vendorId].subtotal += item.productVariant.price * item.quantity;
        itemCount += item.quantity;
        totalAmount += item.productVariant.price * item.quantity;
        return acc;
      },
      {} as Record<string, CartPerVendorSummaryDto>,
    );
    return {
      cartId: cart.id,
      vendors: Object.values(vendorAccumulator),
      totalAmount,
      itemCount,
    };
  }
}
