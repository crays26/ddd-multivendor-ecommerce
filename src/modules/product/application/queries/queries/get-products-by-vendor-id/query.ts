import { Query } from '@nestjs/cqrs';
import { PaginatedDto } from 'src/shared/ddd/application/dtos/paginated-response.dto';
import { ProductDto } from 'src/modules/product/presentation/dtos/responses/product.dto';

export class GetProductsByVendorId extends Query<PaginatedDto<ProductDto>> {
  constructor(
    public readonly vendorId: string,
    public readonly queries: {
      page: number;
      limit: number;
      orderBy: 'name' | 'createdAt' | 'updatedAt';
      sort: 'asc' | 'desc';
    },
  ) {
    super();
  }
}
