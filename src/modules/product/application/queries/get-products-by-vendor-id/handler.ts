import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetProductsByVendorId } from 'src/modules/product/application/queries/get-products-by-vendor-id/query';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ProductEntity } from 'src/modules/product/infrastructure/entities/product.entity';
import { EntityRepository, wrap } from '@mikro-orm/postgresql';
import { PaginatedDto } from 'src/shared/ddd/application/dtos/paginated-response.dto';
import { ProductDto } from 'src/modules/product/presentation/dtos/responses/product.dto';
import { plainToInstance } from 'class-transformer';

@QueryHandler(GetProductsByVendorId)
export class GetProductsByVendorIdQueryHandler
  implements IQueryHandler<GetProductsByVendorId>
{
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: EntityRepository<ProductEntity>,
  ) {}
  async execute(
    query: GetProductsByVendorId,
  ): Promise<PaginatedDto<ProductDto>> {
      const { vendorId, pagination } = query;
      const { page, limit, orderBy, sort } = pagination;
      const offset = (page - 1) * limit;

    const [products, count] = await this.productRepository.findAndCount(
      { vendor: vendorId },
      {
        limit,
        offset,
        orderBy: { [orderBy]: sort },
        populate: ['variants', 'attributes', 'vendor', 'category'],
      },
    );
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const productDtoList = products.map((p) =>
      plainToInstance(ProductDto, wrap(p).toObject()),
    );
    return new PaginatedDto(
      productDtoList,
      count,
      totalPages,
      hasNextPage,
      hasPrevPage,
    );
  }
}
