import { Command } from '@nestjs/cqrs';
import { ProductCreateDto } from 'src/modules/product/presentation/dtos/requests/product.create.dto';

export class CreateProductCommand extends Command<string> {
  constructor(
    public readonly payload: ProductCreateDto & { vendorId: string },
  ) {
    super();
  }
}
