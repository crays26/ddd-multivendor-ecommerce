import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Transactional } from '@mikro-orm/core';
import { CreateBillingCustomerCommand } from './command';
import {
  BILLING_PROVIDER,
  IBillingProvider,
} from '../../../infrastructure/external/billing.provider.interface';
import { BillingCustomerAggRoot } from '../../../domain/aggregate-roots/billing-customer.agg-root';
import {
  BILLING_CUSTOMER_REPO,
  IBillingCustomerRepository,
} from 'src/modules/billing/domain/repositories/billing-customer.repo.interface';

@CommandHandler(CreateBillingCustomerCommand)
export class CreateBillingCustomerHandler
  implements ICommandHandler<CreateBillingCustomerCommand>
{
  constructor(
    @Inject(BILLING_CUSTOMER_REPO)
    private readonly billingCustomerRepository: IBillingCustomerRepository,
    @Inject(BILLING_PROVIDER)
    private readonly billingProvider: IBillingProvider,
  ) {}

  @Transactional()
  async execute(command: CreateBillingCustomerCommand): Promise<{
    billingCustomerId: string;
    providerCustomerId: string;
  }> {
    const { accountId, email, name } = command.payload;

    // Check if billing customer already exists for this account
    const existing =
      await this.billingCustomerRepository.findByAccountId(accountId);
    if (existing) {
      return {
        billingCustomerId: existing.getId(),
        providerCustomerId: existing.getProviderCustomerId()!,
      };
    }

    // Create Stripe customer
    const { providerCustomerId } = await this.billingProvider.ensureCustomer({
      email,
      name,
    });

    // Create billing customer aggregate
    const billingCustomer = BillingCustomerAggRoot.create({
      accountId,
      providerCustomerId,
    });

    await this.billingCustomerRepository.insert(billingCustomer);

    return {
      billingCustomerId: billingCustomer.getId(),
      providerCustomerId,
    };
  }
}
