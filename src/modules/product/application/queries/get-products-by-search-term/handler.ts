import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ProductEntity } from 'src/modules/product/infrastructure/entities/product.entity';
import { EntityRepository, wrap } from '@mikro-orm/postgresql';
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
    const { page, limit, orderBy, sort } = pagination;
    const offset = (page - 1) * limit;

    const subQuery = this.productRepository
      .createQueryBuilder('s')
      .select(['s.id'])
      .addSelect(
        sql`(ts_rank(s.searchable_name, websearch_to_tsquery('english', ${searchTerm})) * 0.7 
        + similarity(s.name, ${searchTerm}) * 0.3)`.as('relevance_score'),
      )
      .where(
        sql`(s.searchable_name @@ websearch_to_tsquery('english', ${searchTerm})) 
        OR (s.name % ${searchTerm})`,
      )
      .orderBy({ [sql`relevance_score`]: QueryOrder.DESC })
      .limit(500);

    const qb = this.productRepository
      .createQueryBuilder('p')
      .select('*')
      .addSelect('sq.relevance_score')
      .leftJoinAndSelect('p.attributes', 'a')
      .leftJoinAndSelect('p.variants', 'v')
      .leftJoinAndSelect('p.vendor', 'vnd')
      .leftJoinAndSelect('p.category', 'c')
      .innerJoin(subQuery, 'sq', { 'p.id': sql.ref('sq.id') })
      .orderBy({ [sql`relevance_score`]: QueryOrder.DESC })
      .limit(limit)
      .offset(offset);

    const [products, count] = await qb.getResultAndCount();

    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const productDtoList = products.map((p) =>
      plainToInstance(GetProductsBySearchTermDto, wrap(p).toObject()),
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
