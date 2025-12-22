import { Command } from '@nestjs/cqrs';
import { ProductUpdateDto } from 'src/modules/product/presentation/dtos/requests/product.update.dto';

export class UpdateProductCommand extends Command<string> {
  constructor(
    public readonly payload: ProductUpdateDto & {
      id: string;
      vendorId: string;
    },
  ) {
    super();
  }
}
