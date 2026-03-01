import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CheckoutCommand } from 'src/modules/order/application/commands/checkout/command';
import { ProductPublicService } from 'src/modules/product/application/public-services/product.public-service';
import {
  IInventoryPublicService,
  INVENTORY_PUBLIC_SERVICE,
} from 'src/modules/inventory/application/public-services/inventory.public-service.interface';
import {
  IOrderRepository,
  ORDER_REPO,
} from 'src/modules/order/domain/repositories/order.repo.interface';
import { OrderAggRoot } from 'src/modules/order/domain/aggregate-roots/order.agg-root';
import { OrderLineItem } from 'src/modules/order/domain/entities/order-line-item.entity';
import { ProductVariantIdVO } from 'src/modules/order/domain/value-objects/product-variant-id.vo';
import {
  CheckoutAggRoot,
  CheckoutStatus,
} from 'src/modules/order/domain/aggregate-roots/checkout.agg-root';
import { CheckoutRepository } from 'src/modules/order/infrastructure/repositories/checkout.repo';
import { OutboxRepository } from 'src/shared/ddd/infrastructure/outbox/outbox.repo';
import { v7 as uuidV7 } from 'uuid';
import { Status } from 'src/shared/ddd/infrastructure/outbox/outbox.entity';
import { Transactional } from '@mikro-orm/core';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConflictException } from '@nestjs/common';

const CHECKOUT_CACHE_TTL_15_MINUTES = 15 * 60;

@CommandHandler(CheckoutCommand)
export class CheckoutCommandHandler
  implements ICommandHandler<CheckoutCommand>
{
  constructor(
    private readonly productPublicService: ProductPublicService,
    @Inject(INVENTORY_PUBLIC_SERVICE)
    private readonly inventoryPublicService: IInventoryPublicService,
    @Inject(ORDER_REPO)
    private readonly orderRepository: IOrderRepository,
    private readonly checkoutRepository: CheckoutRepository,
    private readonly outboxRepository: OutboxRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Transactional()
  async execute(command: CheckoutCommand): Promise<string> {
    const idempotencyKey = command.payload.checkoutData.idempotencyKey;
    const { customerId, checkoutData } = command.payload;

    const existingCheckoutId =
      await this.cacheManager.get<string>(idempotencyKey);
    if (existingCheckoutId) return existingCheckoutId;

    const ordersData = await Promise.all(
      checkoutData.orders.map(async (order) => {
        const lineItems = await Promise.all(
          order.lineItems.map(async (i) => {
            const variant = await this.productPublicService.getVariantById(
              i.productVariantId,
            );
            if (variant.price !== i.expectedPrice)
              throw new ConflictException('Price mismatch');

            return OrderLineItem.create({
              ...i,
              priceAtPurchase: variant.price,
              productVariantId: ProductVariantIdVO.create({
                id: i.productVariantId,
              }),
            });
          }),
        );

        await Promise.all(
          lineItems.map(async (item) => {
            await this.inventoryPublicService.reserveStock(
              item.getProductVariantId(),
              item.getQuantity(),
            );
          }),
        );

        return {
          vendorId: order.vendorId,
          lineItems,
        };
      }),
    );

    const totalAmount = ordersData.reduce(
      (sum, order) =>
        sum + order.lineItems.reduce((s, item) => s + item.getLineTotal(), 0),
      0,
    );

    const paymentDueAt = new Date();
    paymentDueAt.setMinutes(paymentDueAt.getMinutes() + 15);

    const checkoutAggRoot = CheckoutAggRoot.create({
      customerId,
      status: CheckoutStatus.PENDING,
      totalAmount,
      paymentDueAt,
    });

    const createdOrders: OrderAggRoot[] = ordersData.map((orderData) =>
      OrderAggRoot.create({
        checkoutId: checkoutAggRoot.getId(),
        orderItems: orderData.lineItems,
        vendorId: orderData.vendorId,
        customerId,
      }),
    );

    checkoutAggRoot.addCreatedEvent(
      createdOrders.map((order) => ({
        orderId: order.getId(),
        vendorId: order.getVendorId(),
        items: order.getOrderItems().map((item) => ({
          variantId: item.getProductVariantId(),
          quantity: item.getQuantity(),
          priceAtPurchase: item.getPriceAtPurchase(),
        })),
        subtotal: order.getTotalAmount(),
      })),
    );

    await this.checkoutRepository.insert(checkoutAggRoot);
    await this.orderRepository.bulkInsert(createdOrders);

    const events = checkoutAggRoot.getUncommittedEvents();
    for (const event of events) {
      await this.outboxRepository.save({
        id: uuidV7(),
        name: event.constructor.name,
        payload: event,
        status: Status.PENDING,
        createdAt: new Date(),
      });
    }

    await this.cacheManager.set(
      idempotencyKey,
      checkoutAggRoot.getId(),
      CHECKOUT_CACHE_TTL_15_MINUTES,
    );

    return checkoutAggRoot.getId();
  }
}
