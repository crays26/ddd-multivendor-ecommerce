import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ProductEntity } from 'src/modules/product/infrastructure/entities/product.entity';
import { EntityRepository } from '@mikro-orm/postgresql';
import { GetProductBySlugQuery } from './query';
import { GetProductBySlugDto } from './dto';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetProductBySlugQuery)
export class GetProductBySlugQueryHandler
  implements IQueryHandler<GetProductBySlugQuery>
{
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: EntityRepository<ProductEntity>,
  ) {}
  async execute(query: GetProductBySlugQuery): Promise<GetProductBySlugDto> {
    const { slug } = query;
    const product = await this.productRepository.findOne(
      { slug },
      {
        populate: ['variants.inventory', 'attributes', 'vendor', 'category'],
      },
    );
    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    const dto: GetProductBySlugDto = {
      id: product.id,
      name: product.name,
      description: product.description ?? '',
      category: product.category,
      vendor: product.vendor,
      attributes: product.attributes.map((a) => {
        return {
          key: a.key,
          values: a.values,
        };
      }),
      variants: product.variants.map((v) => {
        return {
          id: v.id,
          name: v.name,
          price: v.price,
          stock: v.inventory!.quantity ?? 0,
          associatedAttributes: v.associatedAttributes,
          skuCode: v.skuCode,
          isBase: v.isBase,
        };
      }),
    };
    return dto;
  }
}
