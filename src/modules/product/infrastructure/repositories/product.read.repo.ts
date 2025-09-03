import { EntityRepository, wrap } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ProductEntity } from '../entities/Product.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ProductDto } from '../../presentation/dtos/responses/product.dto';
import { plainToInstance } from 'class-transformer';

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
      { populate: ['variants', 'attributes'] },
    );
    if (!product) return null;

    return plainToInstance(ProductDto, wrap(product).toObject(), {
      excludeExtraneousValues: true
    });
  }
}
