import { Command } from '@nestjs/cqrs';

export interface CreateSetupIntentPayload {
  billingCustomerId: string;
  metadata?: Record<string, string>;
}

export class CreateSetupIntentCommand extends Command<{
  billingCustomerId: string;
  providerSetupIntentId: string;
  clientSecret?: string;
  status: string;
}> {
  constructor(public readonly payload: CreateSetupIntentPayload) {
    super();
  }
}





