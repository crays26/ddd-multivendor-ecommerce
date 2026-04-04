import { IQueryHandler } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/core';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ProductVariantEntity } from 'src/modules/product/infrastructure/entities/product-variant.entity';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { GetGuestCartSummaryQuery } from './query';
import { GuestCartPerVendorSummaryDto, GuestCartSummaryDto } from './dto';

export class GetGuestCartSummaryQueryHandler
  implements IQueryHandler<GetGuestCartSummaryQuery>
{
  constructor(
    private readonly em: EntityManager,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async execute(query: GetGuestCartSummaryQuery): Promise<GuestCartSummaryDto> {
    const { guestCartSessionId } = query;

    const sessionCart = await this.cacheManager.get<
      {
        productVariantId: string;
        quantity: number;
      }[]
    >(`guest-cart:${guestCartSessionId}`);

    if (!sessionCart || sessionCart.length === 0) {
      return {
        cartId: '',
        vendors: [],
        totalAmount: 0,
        itemCount: 0,
      };
    }

    const variantIds = sessionCart.map((item) => item.productVariantId);
    const variants: ProductVariantEntity[] = await this.em.find(
      ProductVariantEntity,
      { id: { $in: variantIds } },
      { populate: ['inventory', 'product.vendor'] },
    );

    let itemCount = 0;
    let totalAmount = 0;
    const groupedByVendor = variants.reduce(
      (acc, variant) => {
        const vendorId = variant.product.vendor.id;
        if (!acc[vendorId]) {
          acc[vendorId] = {
            vendor: {
              id: vendorId,
              name: variant.product.vendor.name,
            },
            items: [],
            subtotal: 0,
          };
        }
        const sessionVariant = sessionCart.find(
          (v) => v.productVariantId === variant.id,
        );
        acc[vendorId].items.push({
          variantId: variant.id,
          variantName: variant.name,
          skuCode: variant.skuCode,
          quantity: sessionVariant!.quantity,
          isOutOfStock: variant.inventory!.quantity < sessionVariant!.quantity,
          price: variant.price,
          lineTotal: variant.price * sessionVariant!.quantity,
        });
        acc[vendorId].subtotal += variant.price * sessionVariant!.quantity;
        itemCount += sessionVariant!.quantity;
        totalAmount += variant.price * sessionVariant!.quantity;

        return acc;
      },
      {} as Record<string, GuestCartPerVendorSummaryDto>,
    );
    return {
      cartId: '',
      vendors: Object.values(groupedByVendor),
      totalAmount,
      itemCount,
    };
  }
}
