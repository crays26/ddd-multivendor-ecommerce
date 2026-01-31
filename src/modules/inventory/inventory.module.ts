import { Module, OnModuleInit } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { InventoryEntity } from './infrastructure/entities/inventory.entity';
import { InventoryRepository } from './infrastructure/repositories/inventory.repo';
import { INVENTORY_REPO } from './domain/repositories/inventory.repo.interface';
import { InventoryPublicService } from './application/public-services/inventory.public-service';
import { INVENTORY_PUBLIC_SERVICE } from './application/public-services/inventory.public-service.interface';
import { ReserveStockCommandHandler } from './application/commands/reserve-stock/handler';
import { ReleaseStockCommandHandler } from './application/commands/release-stock/handler';
import { ConfirmReservationCommandHandler } from './application/commands/confirm-reservation/handler';
import { RestockCommandHandler } from './application/commands/restock/handler';
import { GetAvailableStockQueryHandler } from './application/queries/get-available-stock/handler';
import { InventoryEventProcessor } from './application/processors/inventory-event.processor';
import { QUEUE_NAMES } from 'src/shared/ddd/infrastructure/queue/constants/queue-names';
import { EVENT_NAMES } from 'src/shared/ddd/infrastructure/queue/constants/event-names';
import { EventQueueRegistry } from 'src/shared/ddd/infrastructure/queue/event-queue.registry';

const CommandHandlers = [
  ReserveStockCommandHandler,
  ReleaseStockCommandHandler,
  ConfirmReservationCommandHandler,
  RestockCommandHandler,
];

const QueryHandlers = [GetAvailableStockQueryHandler];

@Module({
  imports: [
    MikroOrmModule.forFeature([InventoryEntity]),
    CqrsModule,
    BullModule.registerQueue({ name: QUEUE_NAMES.INVENTORY_QUEUE }),
  ],
  controllers: [],
  providers: [
    {
      provide: INVENTORY_REPO,
      useClass: InventoryRepository,
    },
    {
      provide: INVENTORY_PUBLIC_SERVICE,
      useClass: InventoryPublicService,
    },
    ...CommandHandlers,
    ...QueryHandlers,
    InventoryEventProcessor,
  ],
  exports: [INVENTORY_REPO, INVENTORY_PUBLIC_SERVICE],
})
export class InventoryModule implements OnModuleInit {
  constructor(private readonly eventRegistry: EventQueueRegistry) {}

  onModuleInit() {
    this.eventRegistry.subscribe(
      EVENT_NAMES.STOCK_CONFIRMATION_FAILED,
      QUEUE_NAMES.PAYMENT_QUEUE,
    );
  }
}
