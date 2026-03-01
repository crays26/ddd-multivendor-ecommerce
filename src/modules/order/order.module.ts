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

import {
  OrderPublicService,
  ORDER_PUBLIC_SERVICE,
} from './application/public-services/order.public-service';

const CommandHandlers = [];
const QueryHandlers = [];

@Module({
  imports: [
    MikroOrmModule.forFeature([
      OrderEntity,
      OrderLineItemEntity,
      CheckoutEntity,
    ]),
    CqrsModule,
    InventoryModule,
  ],
  controllers: [],
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
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [ORDER_PUBLIC_SERVICE],
})
export class OrderModule implements OnModuleInit {
  constructor(private readonly eventRegistry: EventQueueRegistry) {}

  onModuleInit() {
    this.eventRegistry.subscribe(
      EVENT_NAMES.ORDER_GROUP_CREATED,
      QUEUE_NAMES.ORDER_QUEUE,
    );
    this.eventRegistry.subscribe(
      EVENT_NAMES.ORDER_GROUP_CREATED,
      QUEUE_NAMES.PAYMENT_QUEUE,
    );
    this.eventRegistry.subscribe(
      EVENT_NAMES.ORDER_GROUP_CREATED,
      QUEUE_NAMES.INVENTORY_QUEUE,
    );
    this.eventRegistry.subscribe(
      EVENT_NAMES.PAYMENT_SUCCEEDED,
      QUEUE_NAMES.INVENTORY_QUEUE,
    );
    this.eventRegistry.subscribe(
      EVENT_NAMES.PAYMENT_FAILED,
      QUEUE_NAMES.INVENTORY_QUEUE,
    );
    this.eventRegistry.subscribe(
      EVENT_NAMES.ORDER_SHIPPED,
      QUEUE_NAMES.NOTIFICATION_QUEUE,
    );
    this.eventRegistry.subscribe(
      EVENT_NAMES.ORDER_CANCELLED,
      QUEUE_NAMES.PAYMENT_QUEUE,
    );
    this.eventRegistry.subscribe(
      EVENT_NAMES.ORDER_CANCELLED,
      QUEUE_NAMES.INVENTORY_QUEUE,
    );
  }
}
