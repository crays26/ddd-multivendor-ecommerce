import { Module, OnModuleInit } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderEntity } from 'src/modules/order/infrastructure/entities/order.entity';
import { OrderLineItemEntity } from 'src/modules/order/infrastructure/entities/order-line-item.entity';
import { CheckoutEntity } from './infrastructure/entities/checkout.entity';
import { EventQueueRegistry } from 'src/shared/ddd/infrastructure/queue/event-queue.registry';
import { EVENT_NAMES } from 'src/shared/ddd/infrastructure/queue/constants/event-names';
import { QUEUE_NAMES } from 'src/shared/ddd/infrastructure/queue/constants/queue-names';
import { InventoryModule } from 'src/modules/inventory/inventory.module';
import { OrderRepository } from './infrastructure/repositories/order.repo';
import { CheckoutRepository } from './infrastructure/repositories/checkout.repo';
import { ORDER_REPO } from './domain/repositories/order.repo.interface';
import { OrderPublicService } from './application/public-services/order.public-service';
import { CheckoutCommandHandler } from './application/commands/checkout/handler';
import { OrderController } from './presentation/controllers/order.controller';
import { ProductModule } from '../product/product.module';
import { GetCheckoutStatusQueryHandler } from './application/queries/get-checkout-status/handler';
import { GetOrdersByCheckoutIdHandler } from './application/queries/get-orders-by-checkout-id/handler';
import { ORDER_PUBLIC_SERVICE } from './application/public-services/order.public-service.interface';
import { OrderEventProcessor } from './application/processors/order-event.processor';
import { MarkCheckoutStockReservedCommandHandler } from './application/commands/mark-checkout-stock-reserved/handler';
import { UpdateOrdersStatusFromStockHandler } from './application/commands/update-orders-status-from-stock/handler';
import { ExpireReservationCommandHandler } from './application/commands/expire-reservation/handler';
import { ReservationExpiryScheduler } from './application/schedulers/reservation-expiry.scheduler';
import { MarkCheckoutPaidCommandHandler } from './application/commands/mark-checkout-paid/handler';
import { MarkCheckoutFailedCommandHandler } from './application/commands/mark-checkout-failed/handler';

const CommandHandlers = [
  CheckoutCommandHandler,
  MarkCheckoutStockReservedCommandHandler,
  MarkCheckoutPaidCommandHandler,
  MarkCheckoutFailedCommandHandler,
  UpdateOrdersStatusFromStockHandler,
  ExpireReservationCommandHandler,
];
const QueryHandlers = [
  GetCheckoutStatusQueryHandler,
  GetOrdersByCheckoutIdHandler,
];

@Module({
  imports: [
    MikroOrmModule.forFeature([
      OrderEntity,
      OrderLineItemEntity,
      CheckoutEntity,
    ]),
    CqrsModule,
    InventoryModule,
    ProductModule,
  ],
  controllers: [OrderController],
  providers: [
    {
      provide: ORDER_REPO,
      useClass: OrderRepository,
    },
    CheckoutRepository,
    {
      provide: ORDER_PUBLIC_SERVICE,
      useClass: OrderPublicService,
    },
    OrderEventProcessor,
    ReservationExpiryScheduler,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [ORDER_PUBLIC_SERVICE],
})
export class OrderModule implements OnModuleInit {
  constructor(private readonly eventRegistry: EventQueueRegistry) {}

  onModuleInit() {
    this.eventRegistry.subscribe(
      EVENT_NAMES.CHECKOUT_CREATED,
      QUEUE_NAMES.ORDER_QUEUE,
    );

    this.eventRegistry.subscribe(
      EVENT_NAMES.CHECKOUT_CREATED,
      QUEUE_NAMES.PAYMENT_QUEUE,
    );

    this.eventRegistry.subscribe(
      EVENT_NAMES.CHECKOUT_CREATED,
      QUEUE_NAMES.INVENTORY_QUEUE,
    );

    this.eventRegistry.subscribe(
      EVENT_NAMES.STOCK_RESERVED,
      QUEUE_NAMES.ORDER_QUEUE,
    );

    this.eventRegistry.subscribe(
      EVENT_NAMES.INSUFFICIENT_STOCK,
      QUEUE_NAMES.ORDER_QUEUE,
    );

    this.eventRegistry.subscribe(
      EVENT_NAMES.STOCK_CONFIRMATION_COMPLETED,
      QUEUE_NAMES.ORDER_QUEUE,
    );

    this.eventRegistry.subscribe(
      EVENT_NAMES.RESERVATION_EXPIRED,
      QUEUE_NAMES.INVENTORY_QUEUE,
    );

    this.eventRegistry.subscribe(
      EVENT_NAMES.CHECK_RESERVATION_EXPIRY,
      QUEUE_NAMES.ORDER_QUEUE,
    );
  }
}
