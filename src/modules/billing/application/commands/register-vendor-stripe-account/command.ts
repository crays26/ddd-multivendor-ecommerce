import { Command } from '@nestjs/cqrs';

export interface RegisterVendorStripeAccountPayload {
  vendorId: string;
  email?: string;
  businessName?: string;
  country?: string;
  returnUrl: string;
  refreshUrl: string;
}

export class RegisterVendorStripeAccountCommand extends Command<{ url: string }> {
  constructor(public readonly payload: RegisterVendorStripeAccountPayload) {
    super();
  }
}
