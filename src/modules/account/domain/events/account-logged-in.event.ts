import { IEvent } from '@nestjs/cqrs';

export class AccountLoggedInEvent implements IEvent {
  constructor(public readonly accountId: string) {}
}
