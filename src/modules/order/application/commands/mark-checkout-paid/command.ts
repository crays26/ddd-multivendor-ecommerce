import { ICommand } from '@nestjs/cqrs';

export class MarkCheckoutPaidCommand implements ICommand {
  constructor(public readonly checkoutId: string) {}
}
