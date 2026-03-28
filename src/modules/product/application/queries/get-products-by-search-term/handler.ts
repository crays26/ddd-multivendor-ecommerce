import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ProductEntity } from 'src/modules/product/infrastructure/entities/product.entity';
import { EntityRepository } from '@mikro-orm/postgresql'; // Removed 'wrap' as it's no longer needed
import { PaginatedDto } from 'src/shared/ddd/application/dtos/paginated-response.dto';
import { plainToInstance } from 'class-transformer';
import { sql } from '@mikro-orm/postgresql';
import { GetProductsBySearchTermQuery } from './query';
import { GetProductsBySearchTermDto } from './dto';
import { QueryOrder } from '@mikro-orm/core';

@QueryHandler(GetProductsBySearchTermQuery)
export class GetProductsBySearchTermQueryHandler
  implements IQueryHandler<GetProductsBySearchTermQuery>
{
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: EntityRepository<ProductEntity>,
  ) {}

  async execute(
    query: GetProductsBySearchTermQuery,
  ): Promise<PaginatedDto<GetProductsBySearchTermDto>> {
    const { searchTerm, pagination } = query;
    const { page = 1, limit = 100 } = pagination;
    const offset = (page - 1) * limit;
    const CAP_LIMIT = 500;

    const subQuery = this.productRepository
      .createQueryBuilder('s')
      .select(['s.id'])
      .addSelect(
        sql`(ts_rank(s.searchable_name, websearch_to_tsquery('english', ${searchTerm})))`.as(
          'relevance_score',
        ),
      )
      .where(
        sql`(s.searchable_name @@ websearch_to_tsquery('english', ${searchTerm}))`,
      )
      .orderBy({ [sql`relevance_score`]: QueryOrder.DESC })
      .limit(CAP_LIMIT);

    const qb = this.productRepository
      .createQueryBuilder('p')
      .select('*')
      .addSelect('sq.relevance_score')
      .leftJoinAndSelect('p.vendor', 'vnd')
      .leftJoinAndSelect('p.category', 'c')
      .innerJoin(subQuery, 'sq', { 'p.id': sql.ref('sq.id') })
      .limit(limit)
      .offset(offset);

    // 1. Fetch the count (ignores limit/offset constraints automatically)
    const totalCount = await qb.getCount();

    // 2. Fetch raw database rows directly, bypassing entity hydration
    const rawProducts = await qb.execute();

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // 3. rawProducts are already plain JS objects, so wrap().toObject() is removed
    const productDtoList = rawProducts.map((row) =>
      plainToInstance(GetProductsBySearchTermDto, row),
    );

    return new PaginatedDto(
      productDtoList,
      totalCount,
      totalPages,
      hasNextPage,
      hasPrevPage,
    );
  }
}
