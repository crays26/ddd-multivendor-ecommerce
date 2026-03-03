import { Global, Module, OnModuleInit } from '@nestjs/common';
import { BullModule as NestBullModule } from '@nestjs/bullmq';
import { ModuleRef } from '@nestjs/core';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES, QueueName } from './constants/queue-names';
import { QueueRegistry } from './queue.registry';

const allQueueNames = Object.values(QUEUE_NAMES);

@Global()
@Module({
  imports: [
    NestBullModule.forRoot({
      connection: {
        host: process.env.REDIS_NAME!,
        port: 6379,
      },
    }),

    ...allQueueNames.map((name) => NestBullModule.registerQueue({ name })),
  ],
  exports: [NestBullModule],
})
export class ShareQueueModule implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly queueRegistry: QueueRegistry,
  ) {}

  onModuleInit() {
    for (const queueName of allQueueNames) {
      const queue = this.moduleRef.get<Queue>(getQueueToken(queueName), {
        strict: false,
      });
      this.queueRegistry.register(queueName as QueueName, queue);
    }
  }
}
