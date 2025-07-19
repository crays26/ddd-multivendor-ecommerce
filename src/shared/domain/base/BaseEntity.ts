export abstract class BaseEntity<ID = string, Props = unknown> {
  protected readonly _id: ID;
  protected readonly _props: Props;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;

  protected constructor(props: Props & { id: ID }, createdAt?: Date, updatedAt?: Date) {
    this._id = props.id;
    this._props = props;
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = updatedAt ?? new Date();
  }

  public getId(): ID {
    return this._id;
  }

  public getProps(): Props {
    return this._props;
  }

   public getCreatedAt(): Date {
    return this._createdAt;
  }

  public getUpdatedAt(): Date {
    return this._updatedAt;
  }

  public equals(entity?: BaseEntity<ID, Props>): boolean {
    if (entity === null || entity === undefined) return false;
    return this._id === entity._id;
  }
}
