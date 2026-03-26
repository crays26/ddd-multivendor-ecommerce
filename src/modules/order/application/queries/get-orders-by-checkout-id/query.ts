import { IQuery } from '@nestjs/cqrs';

export class GetOrdersByCheckoutIdQuery implements IQuery {
  constructor(public readonly checkoutId: string) {}
}
