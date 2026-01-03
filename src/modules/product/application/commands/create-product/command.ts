import { Command } from '@nestjs/cqrs';
import { CreateProductDto } from './dto';

export class CreateProductCommand extends Command<string> {
  constructor(
    public readonly payload: CreateProductDto & { vendorId: string },
  ) {
    super();
  }
}
