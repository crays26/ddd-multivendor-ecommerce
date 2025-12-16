import { NotFoundException } from '@nestjs/common';
import { GetProductByIdQuery } from './query';
import { QueryHandler } from '@nestjs/cqrs';
import { IQueryHandler } from '@nestjs/cqrs';
import { NotFoundError } from 'rxjs';
import { ProductReadRepository } from 'src/modules/product/infrastructure/repositories/product.read.repo';
import { ProductDto } from 'src/modules/product/presentation/dtos/responses/product.dto';

@QueryHandler(GetProductByIdQuery)

export class GetProductByIdQueryHandler
  implements IQueryHandler<GetProductByIdQuery>
{
  constructor(
    private readonly productReadRepo: ProductReadRepository) {}

  async execute(query: GetProductByIdQuery): Promise<ProductDto> {
    const { productId } = query;
    const productDto = await this.productReadRepo.findOneById(productId);
    if (!productDto) throw new NotFoundException(`Cannot find product with id ${productId}`);
    return productDto;
  }
}