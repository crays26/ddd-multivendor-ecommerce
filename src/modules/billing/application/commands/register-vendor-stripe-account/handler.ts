import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Transactional } from '@mikro-orm/core';
import { RegisterVendorStripeAccountCommand } from './command';
import {
  BILLING_PROVIDER,
  IBillingProvider,
} from '../../../infrastructure/external/billing.provider.interface';
import { BillingVendorAggRoot } from '../../../domain/aggregate-roots/billing-vendor.agg-root';
import {
  BILLING_VENDOR_REPO,
  IBillingVendorRepository,
} from 'src/modules/billing/domain/repositories/billing-vendor.repo.interface';

@CommandHandler(RegisterVendorStripeAccountCommand)
export class RegisterVendorStripeAccountHandler
  implements ICommandHandler<RegisterVendorStripeAccountCommand>
{
  constructor(
    @Inject(BILLING_VENDOR_REPO)
    private readonly billingVendorRepository: IBillingVendorRepository,
    @Inject(BILLING_PROVIDER)
    private readonly billingProvider: IBillingProvider,
  ) {}

  @Transactional()
  async execute(
    command: RegisterVendorStripeAccountCommand,
  ): Promise<{ url: string }> {
    const { vendorId, email, businessName, country, returnUrl, refreshUrl } =
      command.payload;

    let billingVendor =
      await this.billingVendorRepository.findByVendorId(vendorId);

    let providerAccountId = billingVendor?.getProviderAccountId();

    if (!providerAccountId) {
      const result = await this.billingProvider.createConnectedAccount({
        email,
        businessName,
        country: country ?? 'US',
        metadata: { vendorId },
      });
      providerAccountId = result.providerAccountId;

      if (!billingVendor) {
        billingVendor = BillingVendorAggRoot.create({
          vendorId,
          providerAccountId,
        });
        await this.billingVendorRepository.insert(billingVendor);
      } else {
        billingVendor.setProviderAccountId(providerAccountId);
        await this.billingVendorRepository.update(billingVendor);
      }
    }

    const { url } = await this.billingProvider.createAccountLink({
      accountId: providerAccountId,
      returnUrl,
      refreshUrl,
    });

    return { url };
  }
}
