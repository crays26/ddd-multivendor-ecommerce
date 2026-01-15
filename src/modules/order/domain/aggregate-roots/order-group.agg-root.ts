import { v7 as uuidV7 } from 'uuid';
import { CustomerIdVO } from '../value-objects/customer-id.vo';
import { AggregateRootBase } from 'src/shared/ddd/domain/base/aggregate-root.base';
import {
  OrderGroupCreatedEvent,
  OrderGroupEventOrder,
} from '../events/order-group-created.event';

export enum OrderGroupStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

interface OrderGroupProps {
  id: string;
  customerId: CustomerIdVO;
  status: OrderGroupStatus;
  totalAmount: number;
  paymentDueAt: Date;
}

interface CreateOrderGroupProps {
  id?: string;
  customerId: CustomerIdVO;
  status?: OrderGroupStatus;
  totalAmount: number;
  paymentDueAt: Date;
}

export class OrderGroupAggRoot extends AggregateRootBase<
  string,
  OrderGroupProps
> {
  constructor(props: OrderGroupProps) {
    super(props);
    this.validate();
  }

  static create(props: CreateOrderGroupProps): OrderGroupAggRoot {
    return new OrderGroupAggRoot({
      id: props.id ?? uuidV7(),
      customerId: props.customerId,
      status: props.status ?? OrderGroupStatus.PENDING,
      totalAmount: props.totalAmount,
      paymentDueAt: props.paymentDueAt,
    });
  }

  addCreatedEvent(orders: OrderGroupEventOrder[]): void {
    this.apply(
      new OrderGroupCreatedEvent(
        this.getId(),
        this.getCustomerId(),
        orders,
        this.getTotalAmount(),
      ),
    );
  }

  static rehydrate(props: OrderGroupProps): OrderGroupAggRoot {
    return new OrderGroupAggRoot(props);
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

  public getStatus(): OrderGroupStatus {
    return this.props.status;
  }

  public getTotalAmount(): number {
    return this.props.totalAmount;
  }

  public getPaymentDueAt(): Date {
    return this.props.paymentDueAt;
  }

  public setStatus(status: OrderGroupStatus): void {
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
