import { Status } from './outbox.entity';

export class Outbox {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly payload: Record<string, any>,
    public readonly status: Status,
  ) {}
}
