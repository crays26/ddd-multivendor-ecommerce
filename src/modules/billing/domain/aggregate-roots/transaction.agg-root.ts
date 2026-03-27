import { BadRequestException } from '@nestjs/common';
import { AggregateRootBase } from 'src/shared/ddd/domain/base/aggregate-root.base';
import { v7 as uuidV7 } from 'uuid';
import {
  SubTransaction,
  SubTransactionStatus,
} from '../entities/sub-transaction.entity';
import { CheckoutIdVO } from '../value-objects/checkout-id.vo';

export type TransactionProvider = 'stripe';
export type TransactionStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'canceled'
  | 'failed';

interface TransactionProps {
  id: string;
  checkoutId: CheckoutIdVO;
  amount: number;
  currency: string;
  provider: TransactionProvider;
  status: TransactionStatus;
  subTransactions: SubTransaction[];
  providerIntentId?: string;
  clientSecret?: string;
  paymentMethod?: string;
  billingCustomerId?: string;
}

interface CreateTransactionProps {
  checkoutId: string;
  amount: number;
  currency: string;
  provider?: TransactionProvider;
  billingCustomerId?: string;
}

export class TransactionAggRoot extends AggregateRootBase<
  string,
  TransactionProps
> {
  private constructor(props: TransactionProps) {
    super(props);
    this.validate(props);
  }

  static create(props: CreateTransactionProps): TransactionAggRoot {
    return new TransactionAggRoot({
      id: uuidV7(),
      checkoutId: CheckoutIdVO.create({ id: props.checkoutId }),
      amount: props.amount,
      currency: props.currency,
      provider: props.provider ?? 'stripe',
      status: 'requires_payment_method',
      subTransactions: [],
      billingCustomerId: props.billingCustomerId,
    });
  }

  static rehydrate(props: TransactionProps): TransactionAggRoot {
    return new TransactionAggRoot(props);
  }

  private validate(props: CreateTransactionProps | TransactionProps): void {
    if (!props.checkoutId)
      throw new BadRequestException('CheckoutId is required');
    if (!props.currency) throw new BadRequestException('Currency is required');
    if (props.amount <= 0)
      throw new BadRequestException('Amount must be greater than zero');
  }

  getCheckoutId(): string {
    return this.props.checkoutId.getId();
  }

  getAmount(): number {
    return this.props.amount;
  }

  getCurrency(): string {
    return this.props.currency;
  }

  getProvider(): TransactionProvider {
    return this.props.provider;
  }

  getStatus(): TransactionStatus {
    return this.props.status;
  }

  getProviderIntentId(): string | undefined {
    return this.props.providerIntentId;
  }

  getClientSecret(): string | undefined {
    return this.props.clientSecret;
  }

  getPaymentMethod(): string | undefined {
    return this.props.paymentMethod;
  }

  getBillingCustomerId(): string | undefined {
    return this.props.billingCustomerId;
  }

  getSubTransactions(): SubTransaction[] {
    return this.props.subTransactions;
  }

  addSubTransaction(orderId: string, amount: number): SubTransaction {
    const subTx = SubTransaction.create({ orderId, amount });
    this.props.subTransactions.push(subTx);
    return subTx;
  }

  updateSubTransactionStatus(
    orderId: string,
    status: SubTransactionStatus,
  ): void {
    const subTx = this.props.subTransactions.find(
      (st) => st.getOrderId() === orderId,
    );
    if (!subTx) {
      throw new BadRequestException(
        `SubTransaction for order ${orderId} not found`,
      );
    }
    switch (status) {
      case 'succeeded':
        subTx.markSucceeded();
        break;
      case 'failed':
        subTx.markFailed();
        break;
      case 'refunded':
        subTx.markRefunded();
        break;
      default:
        break;
    }
  }

  setStatus(status: TransactionStatus, paymentMethod?: string): void {
    this.props.status = status;
    if (paymentMethod !== undefined) {
      this.props.paymentMethod = paymentMethod;
    }
  }

  setProviderIntent(
    providerIntentId: string,
    clientSecret: string | undefined,
    status: TransactionStatus,
    paymentMethod?: string,
  ): void {
    this.props.providerIntentId = providerIntentId;
    this.props.clientSecret = clientSecret;
    this.props.status = status;
    this.props.paymentMethod = paymentMethod;
  }

  markSucceeded(): void {
    this.props.status = 'succeeded';
  }

  markFailed(): void {
    this.props.status = 'failed';
  }

  markCanceled(): void {
    this.props.status = 'canceled';
  }
}
