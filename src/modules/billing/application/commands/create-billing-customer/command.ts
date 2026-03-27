import { Command } from '@nestjs/cqrs';

export interface CreateBillingCustomerPayload {
  accountId: string;
  email?: string;
  name?: string;
}

export class CreateBillingCustomerCommand extends Command<{
  billingCustomerId: string;
  providerCustomerId: string;
}> {
  constructor(public readonly payload: CreateBillingCustomerPayload) {
    super();
  }
}
