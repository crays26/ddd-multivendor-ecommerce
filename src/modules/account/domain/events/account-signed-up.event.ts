import { IEvent } from '@nestjs/cqrs';

export class AccountSignedUpEvent implements IEvent {
  constructor(
    public readonly accountId: string,
    public readonly email: string,
  ) {}
}
