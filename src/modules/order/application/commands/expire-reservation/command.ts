import { Command } from '@nestjs/cqrs';

export class ExpireReservationCommand extends Command<void> {
  constructor(public readonly checkoutId: string) {
    super();
  }
}
