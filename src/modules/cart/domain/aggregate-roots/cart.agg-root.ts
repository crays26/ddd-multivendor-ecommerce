import { AggregateRootBase } from 'src/shared/ddd/domain/base/aggregate-root.base';
import { BadRequestException } from '@nestjs/common';
import { v7 as uuidV7 } from 'uuid';
import { CartItem } from '../entities/cart-item.entity';
import { CustomerIdVO } from 'src/modules/cart/domain/value-objects/customer-id.vo';

interface CartProps {
  id: string;
  customerId: CustomerIdVO;
  items: CartItem[];
}

interface CreateCartProps {
  id?: string;
  customerId: CustomerIdVO;
  items?: CartItem[];
}

export class CartAggRoot extends AggregateRootBase<string, CartProps> {
  private constructor(props: CartProps) {
    super(props);
  }

  static create(props: CreateCartProps): CartAggRoot {
    const items = props.items ?? [];
    const cart = new CartAggRoot({
      id: props.id ?? uuidV7(),
      customerId: props.customerId,
      items,
    });

    return cart;
  }

  static rehydrate(props: CartProps): CartAggRoot {
    return new CartAggRoot(props);
  }

  // --- Cart Item Operations ---

  public addItem(item: CartItem): void {
    const existingItem = this.props.items.find(
      (i) => i.getProductVariantId() === item.getProductVariantId(),
    );

    if (existingItem) {
      // If item already exists, increment quantity instead
      existingItem.incrementQuantity(item.getQuantity());
    } else {
      this.props.items.push(item);
    }
  }

  public removeItem(productVariantId: string): void {
    this.props.items = this.props.items.filter(
      (item) => item.getProductVariantId() !== productVariantId,
    );
  }

  public updateItemQuantity(
    productVariantId: string,
    newQuantity: number,
  ): void {
    const item = this.props.items.find(
      (i) => i.getProductVariantId() === productVariantId,
    );

    if (!item) {
      throw new BadRequestException('Item not found in cart.');
    }

    item.changeQuantity(newQuantity);
  }

  public clearCart(): void {
    this.props.items = [];
  }

  // --- Private Helpers ---

  // --- Getters ---

  public getId(): string {
    return this.props.id;
  }

  public getCustomerId(): string {
    return this.props.customerId.getId();
  }

  public getItems(): CartItem[] {
    return [...this.props.items];
  }

  public getItemCount(): number {
    return this.props.items.length;
  }

  public getTotalQuantity(): number {
    return this.props.items.reduce((sum, item) => sum + item.getQuantity(), 0);
  }

  public isEmpty(): boolean {
    return this.props.items.length === 0;
  }

  public hasItem(productVariantId: string): boolean {
    return this.props.items.some(
      (item) => item.getProductVariantId() === productVariantId,
    );
  }

  public getItem(productVariantId: string): CartItem | undefined {
    return this.props.items.find(
      (item) => item.getProductVariantId() === productVariantId,
    );
  }
}
