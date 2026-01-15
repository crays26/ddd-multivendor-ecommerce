import { AggregateRootBase } from 'src/shared/ddd/domain/base/aggregate-root.base';
import { VariantIdVO } from '../value-objects/variant-id.vo';
import { BadRequestException } from '@nestjs/common';
import { v7 as uuidV7 } from 'uuid';

interface InventoryProps {
  id: string;
  variantId: VariantIdVO;
  quantity: number;
  reservedQuantity: number;
}

interface CreateInventoryProps {
  id?: string;
  variantId: string;
  quantity: number;
}

export class InventoryAggRoot extends AggregateRootBase<
  string,
  InventoryProps
> {
  private constructor(props: InventoryProps) {
    super(props);
    this.validate();
  }

  static create(props: CreateInventoryProps): InventoryAggRoot {
    return new InventoryAggRoot({
      id: props.id ?? uuidV7(),
      variantId: VariantIdVO.create({ id: props.variantId }),
      quantity: props.quantity,
      reservedQuantity: 0,
    });
  }

  static rehydrate(props: InventoryProps): InventoryAggRoot {
    return new InventoryAggRoot(props);
  }

  private validate() {
    if (this.props.quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }
    if (this.props.reservedQuantity < 0) {
      throw new BadRequestException('Reserved quantity cannot be negative');
    }
    if (this.props.reservedQuantity > this.props.quantity) {
      throw new BadRequestException(
        'Reserved quantity cannot be greater than quantity',
      );
    }
  }

  get availableQuantity(): number {
    return this.props.quantity - this.props.reservedQuantity;
  }

  reserve(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Reserve amount must be positive');
    }
    if (amount > this.availableQuantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${this.availableQuantity}, Requested: ${amount}`,
      );
    }
    this.props.reservedQuantity += amount;
    this.touch();
  }

  release(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Release amount must be positive');
    }
    if (amount > this.props.reservedQuantity) {
      throw new BadRequestException(
        `Cannot release more than reserved. Reserved: ${this.props.reservedQuantity}, Requested: ${amount}`,
      );
    }
    this.props.reservedQuantity -= amount;
    this.touch();
  }

  confirmReservation(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Commit amount must be positive');
    }
    if (amount > this.props.reservedQuantity) {
      throw new BadRequestException(
        `Cannot commit more than reserved. Reserved: ${this.props.reservedQuantity}, Requested: ${amount}`,
      );
    }
    this.props.quantity -= amount;
    this.props.reservedQuantity -= amount;
    this.touch();
  }

  restock(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Restock amount must be positive');
    }
    this.props.quantity += amount;
    this.touch();
  }

  deduct(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Deduct amount must be positive');
    }
    if (amount > this.availableQuantity) {
      throw new BadRequestException(
        `Insufficient available stock. Available: ${this.availableQuantity}, Requested: ${amount}`,
      );
    }
    this.props.quantity -= amount;
    this.touch();
  }

  getId(): string {
    return this.props.id;
  }

  getVariantId(): string {
    return this.props.variantId.getId();
  }

  getQuantity(): number {
    return this.props.quantity;
  }

  getReservedQuantity(): number {
    return this.props.reservedQuantity;
  }
}
