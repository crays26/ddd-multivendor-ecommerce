import { CartItem } from '../../domain/entities/cart-item.entity';
import { CustomerIdVO } from '../../domain/value-objects/customer-id.vo';
import { CartEntity } from '../entities/cart.entity';
import { CartAggRoot } from 'src/modules/cart/domain/aggregate-roots/cart.agg-root';

export class CartDomainMapper {
  static fromPersistence(entity: CartEntity) {
    return CartAggRoot.rehydrate({
      id: entity.id,
      customerId: CustomerIdVO.create({ id: entity.customer.id }),
      items: entity.items.map((item) =>
        CartItem.create({
          id: item.id,
          productVariantId: item.productVariant.id,
          quantity: item.quantity,
        }),
      ),
    });
  }
}
