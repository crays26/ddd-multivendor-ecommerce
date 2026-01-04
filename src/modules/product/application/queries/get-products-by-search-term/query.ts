import { Query } from '@nestjs/cqrs';
import { PaginationQueryDto } from 'src/shared/ddd/application/dtos/pagination-query.dto';
import { PaginatedDto } from 'src/shared/ddd/application/dtos/paginated-response.dto';
import { GetProductsBySearchTermDto } from './dto';

export class GetProductsBySearchTermQuery extends Query<
  PaginatedDto<GetProductsBySearchTermDto>
> {
  constructor(
    public readonly searchTerm: string,
    public readonly pagination: PaginationQueryDto,
  ) {
    super();
  }
}
