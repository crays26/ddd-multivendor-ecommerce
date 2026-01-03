import { Command } from '@nestjs/cqrs';
import { AddAddressDto } from './dto';

export class AddAddressToAccountCommand extends Command<string> {
  constructor(
    public readonly accountId: string,
    public readonly data: AddAddressDto,
  ) {
    super();
  }
}
