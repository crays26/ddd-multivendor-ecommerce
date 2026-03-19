import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OutboxRepository } from './outbox.repo';
import { EventQueueRegistry } from '../queue/event-queue.registry';
import { QueueRegistry } from '../queue/queue.registry';
import { OUTBOX_CRON } from './constants/cron';
import { EventName } from '../queue/constants';
import { CreateRequestContext } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/postgresql';

@Injectable()
export class OutboxPublisher {
  constructor(
    private readonly outboxRepo: OutboxRepository,
    private readonly eventRegistry: EventQueueRegistry,
    private readonly queueRegistry: QueueRegistry,
    private readonly orm: MikroORM,
  ) {}

  @Cron(OUTBOX_CRON.POLLING_INTERVAL)
  @CreateRequestContext()
  async pollAndDispatch(): Promise<void> {
    const allEventNames = this.eventRegistry.getAllEventNames();
    if (allEventNames.length === 0) return;

    const pendingMessages =
      await this.outboxRepo.findAllUnprocessedByNames(allEventNames);

    for (const message of pendingMessages) {
      try {
        const targetQueues = this.eventRegistry.getQueuesForEvent(
          message.name as EventName,
        );

        await Promise.all(
          targetQueues.map(async (queueName) => {
            const queue = this.queueRegistry.get(queueName);
            if (queue) {
              await queue.add(message.name, message.payload);
              console.log(
                `Event "${message.name}" dispatched to queue "${queueName}"`,
              );
            } else {
              console.warn(
                `Queue "${queueName}" not registered for event "${message.name}"`,
              );
            }
          }),
        );

        await this.outboxRepo.markAsProcessed(message);
      } catch (error) {
        await this.outboxRepo.markAsFailed(message);
        console.error(`Failed to dispatch ${message.name}:`, error);
      }
    }
  }
}
