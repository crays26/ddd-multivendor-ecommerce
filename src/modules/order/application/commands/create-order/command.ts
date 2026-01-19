import { Command } from '@nestjs/cqrs';
import { CreateOrderDto } from './dto';

export class CreateOrderCommand extends Command<string> {
  constructor(
    public readonly payload: {
      customerId: string;
      orders: CreateOrderDto[];
    },
  ) {
    super();
  }
}
