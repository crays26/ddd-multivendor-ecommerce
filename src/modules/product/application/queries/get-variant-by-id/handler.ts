import { NotFoundException } from '@nestjs/common';
import { GetVariantByIdQuery } from './query';
import { QueryHandler } from '@nestjs/cqrs';
import { IQueryHandler } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/postgresql';
import { GetVariantByIdDto } from './dto';
import { ProductVariantEntity } from 'src/modules/product/infrastructure/entities/product-variant.entity';

@QueryHandler(GetVariantByIdQuery)
export class GetVariantByIdQueryHandler
  implements IQueryHandler<GetVariantByIdQuery>
{
  constructor(private readonly em: EntityManager) {}

  async execute(query: GetVariantByIdQuery): Promise<GetVariantByIdDto> {
    const { variantId } = query;
    const variantDto = await this.em.findOne(ProductVariantEntity, {
      id: variantId,
    });
    if (!variantDto)
      throw new NotFoundException(`Cannot find variant with id ${variantId}`);
    return variantDto;
  }
}
