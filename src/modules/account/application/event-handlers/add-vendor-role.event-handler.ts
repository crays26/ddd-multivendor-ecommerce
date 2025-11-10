import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AddRoleToAccountCommand } from 'src/modules/account/application/commands/add-role-to-account/command';
import { VendorCreatedEvent } from 'src/modules/vendor/domain/events/vendor-created.event';

@EventsHandler(VendorCreatedEvent)
export class AddVendorRoleEventHandler
  implements IEventHandler<VendorCreatedEvent>
{
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: VendorCreatedEvent): Promise<void> {
    const { accountId } = event;
    const vendorRoleId = process.env.ROLE_VENDOR_ID as string;
    const command = new AddRoleToAccountCommand(accountId, vendorRoleId);
    await this.commandBus.execute(command);
  }
}
