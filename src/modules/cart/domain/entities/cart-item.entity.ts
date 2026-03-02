import { DomainEntityBase } from 'src/shared/ddd/domain/base/domain-entity.base';
import { v7 as uuidV7 } from 'uuid';
import { ProductVariantIdVO } from 'src/modules/cart/domain/value-objects/product-variant-id.vo';
import { BadRequestException } from '@nestjs/common';

interface CartItemProps {
  id: string;
  productVariantId: ProductVariantIdVO;
  quantity: number;
}

interface CreateCartItemProps {
  id?: string;
  productVariantId: string;
  quantity: number;
}

export class CartItem extends DomainEntityBase<string, CartItemProps> {
  private constructor(props: CartItemProps) {
    super(props);
    this.validate(props);
  }

  public static create(props: CreateCartItemProps): CartItem {
    return new CartItem({
      quantity: props.quantity,
      productVariantId: ProductVariantIdVO.create({
        id: props.productVariantId,
      }),
      id: props.id ?? uuidV7(),
    });
  }

  private validate(props: CartItemProps): void {
    if (props.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero.');
    }
  }

  public getId(): string {
    return this.props.id;
  }

  public getProductVariantId(): string {
    return this.props.productVariantId.getId();
  }

  public getQuantity(): number {
    return this.props.quantity;
  }

  public changeQuantity(newQuantity: number): void {
    if (newQuantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero.');
    }
    this.props.quantity = newQuantity;
  }

  public incrementQuantity(amount: number = 1): void {
    if (amount <= 0) {
      throw new BadRequestException('Increment amount must be positive.');
    }
    this.props.quantity += amount;
  }

  public decrementQuantity(amount: number = 1): void {
    if (amount <= 0) {
      throw new BadRequestException('Decrement amount must be positive.');
    }
    const newQuantity = this.props.quantity - amount;
    if (newQuantity <= 0) {
      throw new BadRequestException(
        'Cannot decrement below 1. Remove the item instead.',
      );
    }
    this.props.quantity = newQuantity;
  }
}
