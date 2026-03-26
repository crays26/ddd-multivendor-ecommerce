import { InventoryAggRoot } from 'src/modules/inventory/domain/aggregate-roots/inventory.agg-root';
import { InventoryEntity } from 'src/modules/inventory/infrastructure/entities/inventory.entity';
import { ProductVariantIdVO } from 'src/modules/inventory/domain/value-objects/product-variant-id.vo';

export class InventoryDomainMapper {
  static fromPersistence(entity: InventoryEntity): InventoryAggRoot {
    return InventoryAggRoot.rehydrate({
      id: entity.id,
      productVariantId: ProductVariantIdVO.create({
        id: entity.productVariant.id,
      }),
      quantity: entity.quantity,
      reservedQuantity: entity.reservedQuantity,
    });
  }
}
