import { Injectable } from '@nestjs/common';
import { EventName } from './constants/event-names';
import { QueueName } from './constants/queue-names';

@Injectable()
export class EventQueueRegistry {
  private subscriptions = new Map<EventName, Set<QueueName>>();

  subscribe(eventName: EventName, queueName: QueueName): void {
    if (!this.subscriptions.has(eventName)) {
      this.subscriptions.set(eventName, new Set());
    }
    this.subscriptions.get(eventName)!.add(queueName);
  }

  getQueuesForEvent(eventName: EventName): QueueName[] {
    return [...(this.subscriptions.get(eventName) ?? [])];
  }

  getAllEventNames(): EventName[] {
    return [...this.subscriptions.keys()];
  }
}
