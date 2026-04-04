import { Command } from '@nestjs/cqrs';

export class MergeGuestCartCommand extends Command<void> {
  constructor(
    public readonly payload: {
      customerId: string;
      guestCartSessionId?: string;
    },
  ) {
    super();
  }
}
