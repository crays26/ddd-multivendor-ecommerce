import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  ConnectedAccountResult,
  IBillingProvider,
  PaymentIntentResult,
  PaymentMethodSummary,
  SetupIntentResult,
} from './billing.provider.interface';
import Stripe from 'stripe';

@Injectable()
export class StripeBillingProvider implements IBillingProvider {
  private readonly stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY!;
    if (!secretKey) {
      throw new InternalServerErrorException('STRIPE_SECRET_KEY is missing');
    }
    this.stripe = new Stripe(secretKey);
  }

  async ensureCustomer(input: {
    providerCustomerId?: string;
    email?: string;
    name?: string;
  }): Promise<{ providerCustomerId: string }> {
    if (input.providerCustomerId) {
      return { providerCustomerId: input.providerCustomerId };
    }
    const customer = await this.stripe.customers.create({
      email: input.email,
      name: input.name,
    });
    return { providerCustomerId: customer.id };
  }

  async createConnectedAccount(input: {
    email?: string;
    businessName?: string;
    country: string;
    metadata?: Record<string, string>;
  }): Promise<ConnectedAccountResult> {
    const account = await this.stripe.accounts.create({
      type: 'express',
      email: input.email,
      country: input.country,
      business_profile: {
        name: input.businessName,
      },
      metadata: input.metadata,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    return {
      providerAccountId: account.id,
      status: account.details_submitted ? 'active' : 'pending',
    };
  }

  async createAccountLink(input: {
    accountId: string;
    refreshUrl: string;
    returnUrl: string;
  }): Promise<{ url: string }> {
    const link = await this.stripe.accountLinks.create({
      account: input.accountId,
      refresh_url: input.refreshUrl,
      return_url: input.returnUrl,
      type: 'account_onboarding',
    });
    return { url: link.url };
  }

  async createPaymentIntent(input: {
    amount: number;
    currency: string;
    customerId: string;
    transferGroup?: string;
    metadata?: Stripe.MetadataParam;
  }): Promise<PaymentIntentResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(input.amount),
      currency: input.currency,
      customer: input.customerId,
      transfer_group: input.transferGroup,
      metadata: input.metadata,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });
    console.log(intent);

    return {
      providerIntentId: intent.id,
      clientSecret: intent.client_secret ?? undefined,
      status: intent.status as PaymentIntentResult['status'],
      paymentMethod: (intent.payment_method as string) ?? undefined,
    };
  }

  async createSetupIntent(input: {
    customerId: string;
    metadata?: Record<string, string>;
  }): Promise<SetupIntentResult> {
    const intent = await this.stripe.setupIntents.create({
      customer: input.customerId,
      metadata: input.metadata,
      automatic_payment_methods: { enabled: true },
    });
    return {
      providerSetupIntentId: intent.id,
      clientSecret: intent.client_secret ?? undefined,
      status: intent.status,
    };
  }

  async transfer(input: {
    amount: number;
    currency: string;
    destination: string;
    transferGroup?: string;
    sourceTransaction?: string;
    metadata?: Record<string, string>;
  }): Promise<{ providerTransferId: string }> {
    const transfer = await this.stripe.transfers.create({
      amount: Math.round(input.amount),
      currency: input.currency,
      destination: input.destination,
      transfer_group: input.transferGroup,
      source_transaction: input.sourceTransaction,
      metadata: input.metadata,
    });
    return { providerTransferId: transfer.id };
  }

  async listPaymentMethods(input: {
    customerId: string;
  }): Promise<PaymentMethodSummary[]> {
    const methods = await this.stripe.paymentMethods.list({
      customer: input.customerId,
      type: 'card',
    });

    return methods.data.map((m) => ({
      id: m.id,
      brand: m.card?.brand,
      last4: m.card?.last4,
      expMonth: m.card?.exp_month,
      expYear: m.card?.exp_year,
    }));
  }

  async refund(input: {
    paymentIntentId: string;
    amount: number;
    reason?: string;
    metadata?: Record<string, string>;
  }): Promise<{
    providerRefundId: string;
    status: 'succeeded' | 'pending' | 'failed';
    amount: number;
  }> {
    const refund = await this.stripe.refunds.create({
      payment_intent: input.paymentIntentId,
      amount: Math.round(input.amount),
      reason: input.reason as Stripe.RefundCreateParams.Reason,
      metadata: input.metadata,
    });

    return {
      providerRefundId: refund.id,
      status:
        refund.status === 'succeeded'
          ? 'succeeded'
          : refund.status === 'pending'
            ? 'pending'
            : 'failed',
      amount: refund.amount,
    };
  }
}
