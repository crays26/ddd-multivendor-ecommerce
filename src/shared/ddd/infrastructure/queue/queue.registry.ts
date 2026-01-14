import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QueueName } from './constants/queue-names';

@Injectable()
export class QueueRegistry {
  private queues = new Map<QueueName, Queue>();

  register(name: QueueName, queue: Queue): void {
    this.queues.set(name, queue);
  }

  get(name: QueueName): Queue | undefined {
    return this.queues.get(name);
  }

  has(name: QueueName): boolean {
    return this.queues.has(name);
  }
}
