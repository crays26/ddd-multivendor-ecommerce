import { v7 as uuidV7 } from 'uuid';
import { CustomerIdVO } from '../value-objects/customer-id.vo';
import { AggregateRootBase } from 'src/shared/ddd/domain/base/aggregate-root.base';
import { CheckoutCreatedEvent } from '../events/checkout-created.event';

export enum CheckoutStatus {
  PENDING = 'PENDING',
  STOCK_RESERVED = 'STOCK_RESERVED',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  PAYMENT_SUCCEEDED = 'PAYMENT_SUCCEEDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

interface CheckoutProps {
  id: string;
  customerId: CustomerIdVO;
  status: CheckoutStatus;
  totalAmount: number;
  paymentDueAt: Date;
}

interface CreateCheckoutProps {
  id?: string;
  customerId: string;
  status?: CheckoutStatus;
  totalAmount: number;
  paymentDueAt: Date;
}

export class CheckoutAggRoot extends AggregateRootBase<string, CheckoutProps> {
  constructor(props: CheckoutProps) {
    super(props);
    this.validate();
  }

  static create(props: CreateCheckoutProps): CheckoutAggRoot {
    return new CheckoutAggRoot({
      id: props.id ?? uuidV7(),
      customerId: CustomerIdVO.create({ id: props.customerId }),
      status: props.status ?? CheckoutStatus.PENDING,
      totalAmount: props.totalAmount,
      paymentDueAt: props.paymentDueAt,
    });
  }

  static rehydrate(props: CheckoutProps): CheckoutAggRoot {
    return new CheckoutAggRoot(props);
  }

  private validate() {
    if (this.props.totalAmount <= 0) {
      throw new Error('Total amount must be greater than 0');
    }
    if (this.props.paymentDueAt < new Date()) {
      throw new Error('Payment due at must be in the future');
    }
  }

  public getId(): string {
    return this.props.id;
  }

  public getCustomerId(): string {
    return this.props.customerId.getId();
  }

  public getStatus(): CheckoutStatus {
    return this.props.status;
  }

  public getTotalAmount(): number {
    return this.props.totalAmount;
  }

  public getPaymentDueAt(): Date {
    return this.props.paymentDueAt;
  }

  public setStatus(status: CheckoutStatus): void {
    this.props.status = status;
  }

  public setTotalAmount(totalAmount: number): void {
    this.props.totalAmount = totalAmount;
  }

  public setPaymentDueAt(paymentDueAt: Date): void {
    this.props.paymentDueAt = paymentDueAt;
  }

  public setCustomerId(customerId: CustomerIdVO): void {
    this.props.customerId = customerId;
  }
}
