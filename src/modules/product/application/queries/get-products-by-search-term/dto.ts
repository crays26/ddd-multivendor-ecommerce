import { ProductDto } from 'src/modules/product/presentation/dtos/responses/product.dto';

export class GetProductsBySearchTermDto extends ProductDto {
  relevanceScore: number;
}
