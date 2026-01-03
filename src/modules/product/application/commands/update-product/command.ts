import { Command } from '@nestjs/cqrs';
import { UpdateProductDto } from './dto';

export class UpdateProductCommand extends Command<string> {
  constructor(
    public readonly payload: UpdateProductDto & {
      id: string;
      vendorId: string;
    },
  ) {
    super();
  }
}
