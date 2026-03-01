import { OrderAggRoot } from 'src/modules/order/domain/aggregate-roots/order.agg-root';
import { OrderEntity } from 'src/modules/order/infrastructure/entities/order.entity';
import { ProductVariantIdVO } from 'src/modules/order/domain/value-objects/product-variant-id.vo';
import { OrderLineItem } from 'src/modules/order/domain/entities/order-line-item.entity';
import { CustomerIdVO } from 'src/modules/order/domain/value-objects/customer-id.vo';
import { VendorIdVO } from 'src/modules/order/domain/value-objects/vendor-id.vo';
import { CheckoutIdVO } from 'src/modules/order/domain/value-objects/checkout-id.vo';

export class OrderDomainMapper {
  static fromPersistence(orderEntity: OrderEntity) {
    return OrderAggRoot.rehydrate({
      id: orderEntity.id,
      checkoutId: CheckoutIdVO.create({ id: orderEntity.checkout.id }),
      totalAmount: orderEntity.totalAmount,
      status: orderEntity.status,
      vendorId: VendorIdVO.create({ id: orderEntity.vendor.id }),
      customerId: CustomerIdVO.create({ id: orderEntity.customer.id }),
      orderItems: orderEntity.lineItems.map((o) =>
        OrderLineItem.create({
          id: o.id,
          priceAtPurchase: o.price,
          productVariantId: ProductVariantIdVO.create({
            id: o.productVariant.id,
          }),
          quantity: o.quantity,
        }),
      ),
    });
  }
}
