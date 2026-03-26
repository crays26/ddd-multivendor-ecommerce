import { IQuery } from '@nestjs/cqrs';

export class GetCheckoutStatusQuery implements IQuery {
  constructor(public readonly checkoutId: string) {}
}
