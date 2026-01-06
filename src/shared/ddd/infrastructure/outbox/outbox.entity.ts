import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

export enum Status {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
@Entity({ tableName: 'outbox' })
export class OutboxEntity {
  @PrimaryKey({ type: 'uuid' })
  id: string;

  @Property()
  name: string;

  @Property({ type: 'jsonb' })
  payload: Record<string, any>;

  @Property()
  status: Status;

  @Property({ onCreate: () => new Date() })
  createdAt: Date;

  @Property({ nullable: true })
  processedAt?: Date;
}
