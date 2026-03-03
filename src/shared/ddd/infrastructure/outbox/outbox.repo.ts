import { EntityManager, QueryOrder } from '@mikro-orm/postgresql';
import { OutboxEntity } from './outbox.entity';
import { Status } from './outbox.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OutboxRepository {
  constructor(private readonly em: EntityManager) {}

  async findAllUnprocessedByNames(names: string[]): Promise<OutboxEntity[]> {
    return this.em.fork().findAll(OutboxEntity, {
      where: { name: { $in: names }, status: Status.PENDING },
      orderBy: { createdAt: QueryOrder.ASC },
    });
  }

  async save(outbox: OutboxEntity): Promise<void> {
    await this.em.fork().persistAndFlush(outbox);
  }

  async markAsProcessed(outbox: OutboxEntity): Promise<void> {
    await this.em.fork().nativeUpdate(
      OutboxEntity,
      { id: outbox.id },
      {
        status: Status.COMPLETED,
        processedAt: new Date(),
      },
    );
  }

  async markAsFailed(outbox: OutboxEntity): Promise<void> {
    await this.em.fork().nativeUpdate(
      OutboxEntity,
      { id: outbox.id },
      {
        status: Status.FAILED,
      },
    );
  }
}
