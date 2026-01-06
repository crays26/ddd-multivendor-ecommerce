import { EntityManager, QueryOrder } from '@mikro-orm/postgresql';
import { OutboxEntity } from './outbox.entity';
import { Status } from './outbox.entity';
import { Injectable } from '@nestjs/common';
@Injectable()
export class OutboxRepository {
  constructor(private readonly em: EntityManager) {}

  async findAllUnprocessedByName(name: string): Promise<OutboxEntity[]> {
    return await this.em.findAll(OutboxEntity, {
      where: { name, status: Status.PENDING },
      orderBy: { createdAt: QueryOrder.ASC },
    });
  }

  async save(outbox: OutboxEntity): Promise<void> {
    await this.em.persistAndFlush(outbox);
  }

  async markAsProcessed(outbox: OutboxEntity): Promise<void> {
    outbox.status = Status.COMPLETED;
    outbox.processedAt = new Date();
    await this.em.persistAndFlush(outbox);
  }

  async markAsFailed(outbox: OutboxEntity): Promise<void> {
    outbox.status = Status.FAILED;
    await this.em.persistAndFlush(outbox);
  }
}
