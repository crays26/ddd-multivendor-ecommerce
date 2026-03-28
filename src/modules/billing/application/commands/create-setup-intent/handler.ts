import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSetupIntentCommand } from './command';
import {
  BILLING_PROVIDER,
  IBillingProvider,
} from '../../../infrastructure/external/billing.provider.interface';
import {
  BILLING_CUSTOMER_REPO,
  IBillingCustomerRepository,
} from 'src/modules/billing/domain/repositories/billing-customer.repo.interface';
import { Inject } from '@nestjs/common';

@CommandHandler(CreateSetupIntentCommand)
export class CreateSetupIntentHandler
  implements ICommandHandler<CreateSetupIntentCommand>
{
  constructor(
    @Inject(BILLING_CUSTOMER_REPO)
    private readonly billingCustomerRepository: IBillingCustomerRepository,
    @Inject(BILLING_PROVIDER)
    private readonly billingProvider: IBillingProvider,
  ) {}

  async execute(command: CreateSetupIntentCommand): Promise<{
    billingCustomerId: string;
    providerSetupIntentId: string;
    clientSecret?: string;
    status: string;
  }> {
    const { billingCustomerId, metadata } = command.payload;
    const billingCustomer =
      await this.billingCustomerRepository.findById(billingCustomerId);

    if (!billingCustomer || !billingCustomer.getProviderCustomerId()) {
      throw new Error('Billing customer with provider customer id is required');
    }

    const setupIntent = await this.billingProvider.createSetupIntent({
      customerId: billingCustomer.getProviderCustomerId()!,
      metadata,
    });

    return {
      billingCustomerId,
      providerSetupIntentId: setupIntent.providerSetupIntentId,
      clientSecret: setupIntent.clientSecret,
      status: setupIntent.status,
    };
  }
}
