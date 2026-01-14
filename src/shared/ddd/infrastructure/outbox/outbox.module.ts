import { Global, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ScheduleModule } from '@nestjs/schedule';
import { OutboxEntity } from './outbox.entity';
import { OutboxRepository } from './outbox.repo';
import { OutboxPublisher } from './outbox.publisher';
import { EventQueueRegistry } from '../queue/event-queue.registry';
import { QueueRegistry } from '../queue/queue.registry';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([OutboxEntity]),
    ScheduleModule.forRoot(),
  ],
  providers: [
    OutboxRepository,
    OutboxPublisher,
    EventQueueRegistry,
    QueueRegistry,
  ],
  exports: [OutboxRepository, EventQueueRegistry, QueueRegistry],
})
export class ShareOutboxModule {}
