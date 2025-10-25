import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { AccountSignedUpEvent } from 'src/modules/account/domain/events/account-signed-up.event';
import { AddRoleToAccountCommand } from 'src/modules/account/application/commands/add-role-to-account/command';

@EventsHandler(AccountSignedUpEvent)
export class AddCustomerRoleEventHandler
  implements IEventHandler<AccountSignedUpEvent>
{
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: AccountSignedUpEvent): Promise<void> {
    const { accountId } = event;
    const customerRoleId = process.env.ROLE_CUSTOMER_ID as string;
    const command = new AddRoleToAccountCommand(accountId, customerRoleId);
    await this.commandBus.execute(command);
  }
}
