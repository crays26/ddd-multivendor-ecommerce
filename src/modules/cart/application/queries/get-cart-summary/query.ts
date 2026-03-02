import { Query } from '@nestjs/cqrs';
import { CartSummaryDto } from './dto';

export class GetCartSummaryQuery extends Query<CartSummaryDto> {
  constructor(public readonly customerId: string) {
    super();
  }
}
