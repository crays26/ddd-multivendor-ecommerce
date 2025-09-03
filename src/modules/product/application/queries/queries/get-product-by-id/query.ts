import { Query } from "@nestjs/cqrs";
import { ProductDto } from "src/modules/product/presentation/dtos/responses/product.dto";

export class GetProductByIdQuery extends Query<ProductDto> {
    constructor(
        public readonly productId: string
    ) {
        super();
    }
}