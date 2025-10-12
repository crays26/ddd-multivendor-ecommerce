import { EntityRepository, wrap } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ProductEntity } from '../entities/product.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ProductDto } from '../../presentation/dtos/responses/product.dto';
import { plainToInstance } from 'class-transformer';
import { sql } from '@mikro-orm/postgresql';

@Injectable()
export class ProductReadRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: EntityRepository<ProductEntity>,
    private readonly em: EntityManager,
  ) {}

  async findOneById(productId: string): Promise<ProductDto | null> {
    const product: ProductEntity | null = await this.repo.findOne(
      { id: productId },
      { populate: ['variants', 'attributes', 'vendor', 'category'] },
    );
    if (!product) return null;
    return plainToInstance(ProductDto, wrap(product).toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async findAllByName(searchTerm: string) {
    // const offset = (page - 1) * limit;

    const qb = this.em.createQueryBuilder(ProductEntity, 'p');
    qb.select('p.*');
    qb.leftJoinAndSelect('p.variants', 'v');
    qb.leftJoinAndSelect('p.attributes', 'a');
    qb.leftJoinAndSelect('p.category', 'c');
    qb.leftJoinAndSelect('p.vendor', 'v');
    qb.where(
      sql`to_tsvector('english', ${sql.ref('p.name')}) @@ plainto_tsquery('english', ${searchTerm})`,
    ).orWhere(sql`${sql.ref('p.name')} % ${searchTerm}`);

    // qb.limit(limit).offset(offset);

    // qb.orderBy({
    //   'p.created_at': sortOrder === 'asc' ? 'asc' : 'desc',
    // });
    const count = await qb.getCount();
    return await qb.execute('all');
  }
}
