import { TransactionStatus } from '../../domain/aggregate-roots/transaction.agg-root';

export interface PaymentIntentResult {
  providerIntentId: string;
  clientSecret?: string;
  status: TransactionStatus;
  paymentMethod?: string;
}

export interface SetupIntentResult {
  providerSetupIntentId: string;
  clientSecret?: string;
  status: string;
}

export interface PaymentMethodSummary {
  id: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
}

export interface ConnectedAccountResult {
  providerAccountId: string;
  status?: string;
}

export interface RefundResult {
  providerRefundId: string;
  status: 'succeeded' | 'pending' | 'failed';
  amount: number;
}

export interface IBillingProvider {
  ensureCustomer(input: {
    providerCustomerId?: string;
    email?: string;
    name?: string;
  }): Promise<{ providerCustomerId: string }>;

  createConnectedAccount(input: {
    email?: string;
    businessName?: string;
    country: string;
    metadata?: Record<string, string>;
  }): Promise<ConnectedAccountResult>;

  createPaymentIntent(input: {
    amount: number;
    currency: string;
    customerId: string;
    transferGroup?: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentIntentResult>;

  createSetupIntent(input: {
    customerId: string;
    metadata?: Record<string, string>;
  }): Promise<SetupIntentResult>;

  createAccountLink(input: {
    accountId: string;
    refreshUrl: string;
    returnUrl: string;
  }): Promise<{ url: string }>;

  transfer(input: {
    amount: number;
    currency: string;
    destination: string;
    transferGroup?: string;
    sourceTransaction?: string;
    metadata?: Record<string, string>;
  }): Promise<{ providerTransferId: string }>;

  listPaymentMethods(input: {
    customerId: string;
  }): Promise<PaymentMethodSummary[]>;

  refund(input: {
    paymentIntentId: string;
    amount: number;
    reason?: string;
    metadata?: Record<string, string>;
  }): Promise<RefundResult>;
}

export const BILLING_PROVIDER = Symbol('BILLING_PROVIDER');
