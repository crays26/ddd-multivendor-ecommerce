import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateOrderCommand } from 'src/modules/order/application/commands/create-order/command';
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
import { VendorIdVO } from 'src/modules/order/domain/value-objects/vendor-id.vo';
import { CustomerIdVO } from 'src/modules/order/domain/value-objects/customer-id.vo';
import { OrderLineItem } from 'src/modules/order/domain/entities/order-line-item.entity';
import { ProductVariantIdVO } from 'src/modules/order/domain/value-objects/product-variant-id.vo';
import {
  OrderGroupAggRoot,
  OrderGroupStatus,
} from 'src/modules/order/domain/aggregate-roots/order-group.agg-root';
import { OrderGroupRepository } from 'src/modules/order/infrastructure/repositories/order-group.repo';
import { OutboxRepository } from 'src/shared/ddd/infrastructure/outbox/outbox.repo';
import { v7 as uuidV7 } from 'uuid';
import { Status } from 'src/shared/ddd/infrastructure/outbox/outbox.entity';
import { Transactional } from '@mikro-orm/core';

@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler
  implements ICommandHandler<CreateOrderCommand>
{
  constructor(
    private readonly productPublicService: ProductPublicService,
    @Inject(INVENTORY_PUBLIC_SERVICE)
    private readonly inventoryPublicService: IInventoryPublicService,
    @Inject(ORDER_REPO)
    private readonly orderRepository: IOrderRepository,
    private readonly orderGroupRepository: OrderGroupRepository,
    private readonly outboxRepository: OutboxRepository,
  ) {}

  @Transactional()
  async execute(command: CreateOrderCommand): Promise<string> {
    const { customerId, orders } = command.payload;

    const customerIdVO = CustomerIdVO.create({ id: customerId });

    const ordersData = await Promise.all(
      orders.map(async (order) => {
        const lineItems = await Promise.all(
          order.lineItems.map(async (i) => {
            const variant = await this.productPublicService.getVariantById(
              i.productVariantId,
            );

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

    const orderGroupAggRoot = OrderGroupAggRoot.create({
      customerId: customerIdVO,
      status: OrderGroupStatus.PENDING,
      totalAmount,
      paymentDueAt,
    });

    const createdOrders: OrderAggRoot[] = ordersData.map((orderData) =>
      OrderAggRoot.create({
        orderGroupId: orderGroupAggRoot.getId(),
        orderItems: orderData.lineItems,
        vendorId: VendorIdVO.create({ id: orderData.vendorId }),
        customerId: customerIdVO,
      }),
    );

    orderGroupAggRoot.addCreatedEvent(
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

    await this.orderGroupRepository.insert(orderGroupAggRoot);
    await this.orderRepository.bulkInsert(createdOrders);

    const events = orderGroupAggRoot.getUncommittedEvents();
    for (const event of events) {
      await this.outboxRepository.save({
        id: uuidV7(),
        name: event.constructor.name,
        payload: event,
        status: Status.PENDING,
        createdAt: new Date(),
      });
    }

    return orderGroupAggRoot.getId();
  }
}
