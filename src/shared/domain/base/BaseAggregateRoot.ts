import { BaseEntity } from "./BaseEntity";
import { EventEmitter2 } from "@nestjs/event-emitter";

export abstract class BaseAggregateRoot<ID = string, Props = unknown> extends BaseEntity<ID, Props> {
  private domainEvents: any[] = [];

  protected constructor(props: Props & { id: ID }) {
    super(props);
  }

  protected addEvent(event: any): void {
    this.domainEvents.push(event);
  }

  public getDomainEvents(): any[] {
    return this.domainEvents;
  }

  public clearEvents(): void {
    this.domainEvents = [];
  }

  public async commitEvents(eventEmitter: EventEmitter2): Promise<void> {
    const events = [...this.domainEvents];
    this.clearEvents();

    for (const event of events) {
      await eventEmitter.emitAsync(event.constructor.name, event);
    }
  }
}