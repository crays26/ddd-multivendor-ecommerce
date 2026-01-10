import { Query } from '@nestjs/cqrs';
import { GetVariantByIdDto } from './dto';

export class GetVariantByIdQuery extends Query<GetVariantByIdDto> {
  constructor(public readonly variantId: string) {
    super();
  }
}
