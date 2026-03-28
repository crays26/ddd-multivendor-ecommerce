import { IQuery } from '@nestjs/cqrs';

export class GetTransactionByCheckoutIdQuery implements IQuery {
  constructor(public readonly checkoutId: string) {}
}
