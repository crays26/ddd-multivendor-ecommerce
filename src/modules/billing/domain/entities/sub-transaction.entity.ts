import { DomainEntityBase } from 'src/shared/ddd/domain/base/domain-entity.base';
import { v7 as uuidV7 } from 'uuid';
import { OrderIdVO } from '../value-objects/order-id.vo';

export type SubTransactionStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded';

interface SubTransactionProps {
  id: string;
  amount: number;
  status: SubTransactionStatus;
  transferId?: string;
  orderId: OrderIdVO;
}

interface CreateSubTransactionProps {
  amount: number;
  orderId: string;
}

export class SubTransaction extends DomainEntityBase<
  string,
  SubTransactionProps
> {
  private constructor(props: SubTransactionProps) {
    super(props);
  }

  static create(props: CreateSubTransactionProps): SubTransaction {
    return new SubTransaction({
      id: uuidV7(),
      orderId: OrderIdVO.create({ id: props.orderId }),
      amount: props.amount,
      status: 'pending',
    });
  }

  static rehydrate(props: SubTransactionProps): SubTransaction {
    return new SubTransaction(props);
  }

  getOrderId(): string {
    return this.props.orderId.getId();
  }

  getAmount(): number {
    return this.props.amount;
  }

  getStatus(): SubTransactionStatus {
    return this.props.status;
  }

  getTransferId(): string | undefined {
    return this.props.transferId;
  }

  markSucceeded(): void {
    this.props.status = 'succeeded';
  }

  markFailed(): void {
    this.props.status = 'failed';
  }

  markRefunded(): void {
    this.props.status = 'refunded';
  }

  setTransferId(transferId: string): void {
    this.props.transferId = transferId;
  }
}
