import { Query } from '@nestjs/cqrs';
import { GetProductBySlugDto } from './dto';

export class GetProductBySlugQuery extends Query<GetProductBySlugDto> {
  constructor(public readonly slug: string) {
    super();
  }
}
