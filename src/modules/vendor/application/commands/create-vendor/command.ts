import { Command } from '@nestjs/cqrs';
import { VendorCreateDto } from 'src/modules/vendor/presentation/dtos/requests/vendor.create.dto';

export class CreateVendorCommand extends Command<string> {
  constructor(public readonly payload: VendorCreateDto) {
    super();
  }
}
