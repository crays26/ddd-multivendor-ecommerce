import { InventoryAggRoot } from 'src/modules/inventory/domain/aggregate-roots/inventory.agg-root';
import { InventoryEntity } from 'src/modules/inventory/infrastructure/entities/inventory.entity';
import { VariantIdVO } from 'src/modules/inventory/domain/value-objects/variant-id.vo';

export class InventoryDomainMapper {
  static fromPersistence(entity: InventoryEntity): InventoryAggRoot {
    return InventoryAggRoot.rehydrate({
      id: entity.id,
      variantId: VariantIdVO.create({ id: entity.variantId }),
      quantity: entity.quantity,
      reservedQuantity: entity.reservedQuantity,
    });
  }

  static toPersistence(
    aggregate: InventoryAggRoot,
    entity: InventoryEntity,
  ): void {
    entity.id = aggregate.getId();
    entity.variantId = aggregate.getVariantId();
    entity.quantity = aggregate.getQuantity();
    entity.reservedQuantity = aggregate.getReservedQuantity();
  }
}
