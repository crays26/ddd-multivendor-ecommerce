import { DomainEntityBase } from 'src/shared/ddd/domain/base/domain-entity.base';
import { v7 as uuidV7 } from 'uuid';
import {ProductVariantIdVO} from "src/modules/order/domain/value-objects/product-variant-id.vo";
import { BadRequestException } from '@nestjs/common';

interface OrderLineItemProps {
    id: string;
    productVariantId: ProductVariantIdVO;
    quantity: number;
    priceAtPurchase: number;
}

interface CreateOrderLineItemProps {
    id?: string;
    productVariantId: string;
    quantity: number;
    priceAtPurchase: number;
}

export class OrderLineItem extends DomainEntityBase<string, OrderLineItemProps> {
    private constructor(props: OrderLineItemProps) {
        super(props);
        this.validate(props);
    }

    public static create(
        props: CreateOrderLineItemProps,
    ): OrderLineItem {
        return new OrderLineItem({
            ...props,
            id: props.id ?? uuidV7(),
            productVariantId: ProductVariantIdVO.create(props.productVariantId),
        });

    }

    private validate(props: OrderLineItemProps): void {
        if (props.quantity <= 0) {
            throw new BadRequestException('Quantity must be greater than zero.');
        }
        if (props.priceAtPurchase < 0) {
            throw new BadRequestException('Price cannot be negative.');
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

    public getPriceAtPurchase(): number {
        return this.props.priceAtPurchase;
    }

    public getLineTotal(): number {
        return this.props.quantity * this.props.priceAtPurchase;
    }

    public changeQuantity(newQuantity: number): void {
        if (newQuantity <= 0) {
            throw new BadRequestException('Quantity must be greater than zero.');
        }
        this.props.quantity = newQuantity;
    }
}