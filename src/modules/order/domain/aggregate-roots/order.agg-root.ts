import { AggregateRootBase } from 'src/shared/ddd/domain/base/aggregate-root.base';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { v7 as uuidV7 } from 'uuid';
import { OrderLineItem } from '../entities/order-line-item.entity';
import { CustomerIdVO } from 'src/modules/order/domain/value-objects/customer-id.vo';
import { VendorIdVO } from 'src/modules/order/domain/value-objects/vendor-id.vo';
import { CheckoutIdVO } from '../value-objects/checkout-id.vo';

export enum OrderStatus {
  PENDING = 'PENDING',
  STOCK_RESERVED = 'STOCK_RESERVED',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  CANCELLED = 'CANCELLED',
}

interface OrderProps {
  id: string;
  orderItems: OrderLineItem[];
  status: OrderStatus;
  totalAmount: number;
  customerId: CustomerIdVO;
  vendorId: VendorIdVO;
  checkoutId: CheckoutIdVO;
}

interface CreateOrderProps {
  id?: string;
  orderItems: OrderLineItem[];
  customerId: string;
  vendorId: string;
  checkoutId: string;
}

export class OrderAggRoot extends AggregateRootBase<string, OrderProps> {
  private constructor(props: OrderProps) {
    super(props);
    this.validate();
  }

  static create(props: CreateOrderProps): OrderAggRoot {
    const totalAmount = props.orderItems.reduce(
      (sum, item) => sum + item.getLineTotal(),
      0,
    );

    const order = new OrderAggRoot({
      id: props.id ?? uuidV7(),
      orderItems: props.orderItems,
      status: OrderStatus.PENDING,
      totalAmount: totalAmount,
      customerId: CustomerIdVO.create({ id: props.customerId }),
      vendorId: VendorIdVO.create({ id: props.vendorId }),
      checkoutId: CheckoutIdVO.create({ id: props.checkoutId }),
    });

    return order;
  }

  static rehydrate(props: OrderProps): OrderAggRoot {
    return new OrderAggRoot(props);
  }

  private validate(): void {
    if (!this.props.orderItems || this.props.orderItems.length === 0) {
      throw new BadRequestException('Order must have at least one line item.');
    }

    const calculatedTotal = this.props.orderItems.reduce(
      (sum, item) => sum + item.getLineTotal(),
      0,
    );

    if (this.props.totalAmount !== calculatedTotal) {
      throw new Error(
        `Order total mismatch. Stored: ${this.props.totalAmount}, Calculated: ${calculatedTotal}`,
      );
    }

    if (!Object.values(OrderStatus).includes(this.props.status)) {
      throw new BadRequestException(
        `Invalid order status: ${this.props.status}`,
      );
    }
  }

  public payOrder(): void {
    if (this.props.status !== OrderStatus.STOCK_RESERVED) {
      throw new ConflictException('Only stock-reserved orders can be paid.');
    }
    this.props.status = OrderStatus.PAID;
    // this.addEvent(new OrderPaidEvent(this.getId()));
  }

  public shipOrder(): void {
    if (this.props.status !== OrderStatus.PAID) {
      throw new ConflictException('Only paid orders can be shipped.');
    }
    this.props.status = OrderStatus.SHIPPED;
    // this.addEvent(new OrderShippedEvent(this.getId()));
  }

  public cancelOrder(): void {
    if (this.props.status === OrderStatus.SHIPPED) {
      throw new ConflictException('Cannot cancel a shipped order.');
    }
    if (this.props.status === OrderStatus.PAID) {
      throw new ConflictException(
        'Cannot cancel a paid order directly. Initiate a refund instead.',
      );
    }
    if (this.props.status === OrderStatus.CANCELLED) {
      return; // Already cancelled, do nothing
    }
    this.props.status = OrderStatus.CANCELLED;
    // this.addEvent(new OrderCancelledEvent(this.getId()));
  }

  public addLineItem(item: OrderLineItem): void {
    this.assertOrderIsModifiable();

    const existingItem = this.props.orderItems.find(
      (i) => i.getProductVariantId() === item.getProductVariantId(),
    );

    if (existingItem) {
      throw new ConflictException(
        'Product SKU already in order. Use updateLineItemQuantity instead.',
      );
    }

    this.props.orderItems.push(item);
    this.recalculateTotal();
  }

  public removeLineItem(productVariantId: string): void {
    this.assertOrderIsModifiable();

    if (
      this.props.orderItems.length === 1 &&
      this.props.orderItems[0].getProductVariantId() === productVariantId
    ) {
      throw new BadRequestException(
        'Cannot remove the last item from an order.',
      );
    }

    const initialLength = this.props.orderItems.length;
    this.props.orderItems = this.props.orderItems.filter(
      (item) => item.getProductVariantId() !== productVariantId,
    );

    if (this.props.orderItems.length < initialLength) {
      this.recalculateTotal();
      // this.addEvent(new OrderItemRemovedEvent(...));
    }
  }

  public updateLineItemQuantity(
    productSkuId: string,
    newQuantity: number,
  ): void {
    this.assertOrderIsModifiable();

    const item = this.props.orderItems.find(
      (i) => i.getProductVariantId() === productSkuId,
    );

    if (!item) {
      throw new BadRequestException('Line item not found in order.');
    }

    item.changeQuantity(newQuantity);

    this.recalculateTotal();
    // this.addEvent(new OrderItemQuantityUpdatedEvent(...));
  }

  // --- Private Helpers ---

  private recalculateTotal(): void {
    this.props.totalAmount = this.props.orderItems.reduce(
      (sum, item) => sum + item.getLineTotal(),
      0,
    );
  }

  private assertOrderIsModifiable(): void {
    if (
      this.props.status === OrderStatus.PAID ||
      this.props.status === OrderStatus.SHIPPED ||
      this.props.status === OrderStatus.CANCELLED
    ) {
      throw new ConflictException(
        'Cannot modify an order that is paid, shipped, or cancelled.',
      );
    }
  }

  // --- Getters ---

  public getId(): string {
    return this.props.id;
  }
  public getCustomerId(): string {
    return this.props.customerId.getId();
  }

  public getVendorId(): string {
    return this.props.vendorId.getId();
  }

  public getStatus(): OrderStatus {
    return this.props.status;
  }

  public getTotalAmount(): number {
    return this.props.totalAmount;
  }

  public getOrderItems(): OrderLineItem[] {
    return [...this.props.orderItems];
  }

  public getCheckoutId(): string {
    return this.props.checkoutId.getId();
  }
}
