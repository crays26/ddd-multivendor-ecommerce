export abstract class BaseEntity<ID = string, Props = unknown> {
  protected readonly id: ID;
  protected readonly props: Props;
  protected readonly createdAt: Date;
  protected updatedAt: Date;

  protected constructor(
    props: Props & { id: ID },
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.id = props.id;
    this.props = props;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  public getId(): ID {
    return this.id;
  }

  public getProps(): Props {
    return this.props;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public equals(entity?: BaseEntity<ID, Props>): boolean {
    if (entity === null || entity === undefined) return false;
    return this.id === entity.id;
  }
}
