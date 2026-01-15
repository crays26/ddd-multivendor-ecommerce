import { DomainEntityBase } from 'src/shared/ddd/domain/base/domain-entity.base';
import { v7 as uuidV7 } from 'uuid';
import { CustomerIdVO } from '../value-objects/customer-id.vo';

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
  status: OrderGroupStatus;
  totalAmount: number;
  paymentDueAt: Date;
}

export class OrderGroup extends DomainEntityBase<string, OrderGroupProps> {
  constructor(props: OrderGroupProps) {
    super(props);
  }

  static create(props: CreateOrderGroupProps): OrderGroup {
    return new OrderGroup({
      ...props,
      id: props.id ?? uuidV7(),
      status: props.status ?? OrderGroupStatus.PENDING,
    });
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
