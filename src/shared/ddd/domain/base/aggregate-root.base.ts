import { AggregateRoot as CqrsAggregateRoot } from '@nestjs/cqrs';

export abstract class AggregateRootBase<
  ID = string,
  Props = unknown,
> extends CqrsAggregateRoot {
  protected readonly id: ID;
  protected readonly props: Props;
  protected readonly createdAt: Date;
  protected updatedAt: Date;

  protected constructor(
    props: Props & { id: ID; createdAt?: Date; updatedAt?: Date },
  ) {
    super();
    this.id = props.id;
    this.props = props;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public touch(): void {
    this.updatedAt = new Date();
  }

  public getId(): ID {
    return this.id;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public getDomainEvents(): unknown[] {
    return (this as any)._domainEvents ?? [];
  }
}
