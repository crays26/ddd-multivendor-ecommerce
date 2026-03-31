import { v7 as uuidV7 } from 'uuid';
import { CustomerIdVO } from '../value-objects/customer-id.vo';
import { AggregateRootBase } from 'src/shared/ddd/domain/base/aggregate-root.base';
import { ConflictException } from '@nestjs/common';

export enum CheckoutStatus {
  PENDING = 'PENDING',
  STOCK_RESERVED = 'STOCK_RESERVED',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
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
  private constructor(props: CheckoutProps, skipDateValidation = false) {
    super(props);
    this.validate(skipDateValidation);
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
    return new CheckoutAggRoot(props, true);
  }

  private validate(skipDateValidation = false) {
    if (this.props.totalAmount <= 0) {
      throw new Error('Total amount must be greater than 0');
    }
    if (!skipDateValidation && this.props.paymentDueAt < new Date()) {
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

  public markStockReserved(): void {
    if (this.props.status !== CheckoutStatus.PENDING) {
      throw new ConflictException('Checkout must be PENDING to reserve stock.');
    }
    this.props.status = CheckoutStatus.STOCK_RESERVED;
  }

  public markPaid(): void {
    if (this.props.status !== CheckoutStatus.STOCK_RESERVED) {
      throw new ConflictException(
        'Checkout must be STOCK_RESERVED to be marked as PAID.',
      );
    }
    this.props.status = CheckoutStatus.PAID;
  }

  public markFailed(): void {
    if (this.props.status === CheckoutStatus.COMPLETED) {
      throw new ConflictException('Cannot fail a completed checkout.');
    }
    if (this.props.status === CheckoutStatus.CANCELLED) {
      return;
    }
    this.props.status = CheckoutStatus.FAILED;
  }

  public markCompleted(): void {
    if (this.props.status !== CheckoutStatus.PAID) {
      throw new ConflictException(
        'Checkout must be PAID to be marked as COMPLETED.',
      );
    }
    this.props.status = CheckoutStatus.COMPLETED;
  }

  public cancel(): void {
    if (this.props.status === CheckoutStatus.COMPLETED) {
      throw new ConflictException('Cannot cancel a completed checkout.');
    }
    if (this.props.status === CheckoutStatus.PAID) {
      throw new ConflictException(
        'Cannot cancel a paid checkout directly. Initiate a refund instead.',
      );
    }
    if (
      this.props.status === CheckoutStatus.CANCELLED ||
      this.props.status === CheckoutStatus.FAILED
    ) {
      return;
    }
    this.props.status = CheckoutStatus.CANCELLED;
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
