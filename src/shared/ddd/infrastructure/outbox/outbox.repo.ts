import { EntityManager, QueryOrder } from '@mikro-orm/postgresql';
import { OutboxEntity } from './outbox.entity';
import { Status } from './outbox.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class OutboxRepository {
  constructor(private readonly em: EntityManager) {}

  async findAllUnprocessedByNames(
    names: string[],
    fork: boolean = false,
  ): Promise<OutboxEntity[]> {
    const em = fork ? this.em.fork() : this.em;
    return em.findAll(OutboxEntity, {
      where: { name: { $in: names }, status: Status.PENDING },
      orderBy: { createdAt: QueryOrder.ASC },
    });
  }

  async save(outbox: OutboxEntity, fork: boolean = false): Promise<void> {
    const em = fork ? this.em.fork() : this.em;
    await em.persist(outbox).flush();
  }

  async markAsProcessed(
    outbox: OutboxEntity,
    fork: boolean = false,
  ): Promise<void> {
    const em = fork ? this.em.fork() : this.em;
    await em.nativeUpdate(
      OutboxEntity,
      { id: outbox.id },
      {
        status: Status.COMPLETED,
        processedAt: new Date(),
      },
    );
  }

  async markAsFailed(
    outbox: OutboxEntity,
    fork: boolean = false,
  ): Promise<void> {
    const em = fork ? this.em.fork() : this.em;
    await em.nativeUpdate(
      OutboxEntity,
      { id: outbox.id },
      {
        status: Status.FAILED,
      },
    );
  }
}
