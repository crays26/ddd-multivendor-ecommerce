import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager, sql } from '@mikro-orm/postgresql';
import { InventoryEntity } from '../entities/inventory.entity';
import { InventoryAggRoot } from '../../domain/aggregate-roots/inventory.agg-root';
import { IInventoryRepository } from '../../domain/repositories/inventory.repo.interface';
import { InventoryDomainMapper } from '../mappers/inventory.mapper';
import { ProductVariantEntity } from 'src/modules/product/infrastructure/entities/product-variant.entity';

@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<InventoryAggRoot | null> {
    const entity = await this.em.findOne(InventoryEntity, { id });
    if (!entity) return null;
    return InventoryDomainMapper.fromPersistence(entity);
  }

  async findByVariantId(
    productVariantId: string,
  ): Promise<InventoryAggRoot | null> {
    const entity = await this.em.findOne(InventoryEntity, {
      productVariant: productVariantId,
    });
    if (!entity) return null;
    return InventoryDomainMapper.fromPersistence(entity);
  }

  async findByVariantIds(
    productVariantIds: string[],
  ): Promise<InventoryAggRoot[]> {
    const entities = await this.em.find(InventoryEntity, {
      productVariant: { id: { $in: productVariantIds } },
    });
    return entities.map((e) => InventoryDomainMapper.fromPersistence(e));
  }

  async insert(aggregate: InventoryAggRoot): Promise<void> {
    const entity = new InventoryEntity();
    entity.id = aggregate.getId();
    entity.productVariant = this.em.getReference(
      ProductVariantEntity,
      aggregate.getProductVariantId(),
    );
    entity.quantity = aggregate.getQuantity();
    entity.reservedQuantity = aggregate.getReservedQuantity();
    await this.em.persist(entity).flush();
  }

  async bulkInsert(aggregates: InventoryAggRoot[]): Promise<void> {
    for (const aggregate of aggregates) {
      const entity = new InventoryEntity();
      entity.id = aggregate.getId();
      entity.productVariant = this.em.getReference(
        ProductVariantEntity,
        aggregate.getProductVariantId(),
      );
      entity.quantity = aggregate.getQuantity();
      entity.reservedQuantity = aggregate.getReservedQuantity();
      this.em.persist(entity);
    }
    await this.em.flush();
  }

  async update(aggregate: InventoryAggRoot): Promise<void> {
    const entity = await this.em.findOneOrFail(InventoryEntity, {
      id: aggregate.getId(),
    });
    entity.quantity = aggregate.getQuantity();
    entity.reservedQuantity = aggregate.getReservedQuantity();
    await this.em.persist(entity).flush();
  }

  async reserveStock(productVariantId: string, amount: number): Promise<void> {
    const qb = this.em.createQueryBuilder(InventoryEntity);
    const result = await qb
      .update({
        reservedQuantity: sql`reserved_quantity + ${amount}`,
      })
      .where({ productVariant: productVariantId })
      .andWhere(sql`quantity - reserved_quantity >= ${amount}`)
      .execute();

    if (result.affectedRows === 0) {
      throw new ConflictException(
        `Insufficient stock for product variant ${productVariantId}`,
      );
    }
  }

  async releaseStock(productVariantId: string, amount: number): Promise<void> {
    const qb = this.em.createQueryBuilder(InventoryEntity);
    const result = await qb
      .update({
        reservedQuantity: sql`reserved_quantity - ${amount}`,
      })
      .where({ productVariant: productVariantId })
      .andWhere(sql`reserved_quantity >= ${amount}`)
      .execute();

    if (result.affectedRows === 0) {
      throw new ConflictException(
        `Cannot release stock for product variant ${productVariantId}: insufficient reserved quantity`,
      );
    }
  }

  async confirmReservation(
    productVariantId: string,
    amount: number,
  ): Promise<void> {
    const qb = this.em.createQueryBuilder(InventoryEntity);
    const result = await qb
      .update({
        quantity: sql`quantity - ${amount}`,
        reservedQuantity: sql`reserved_quantity - ${amount}`,
      })
      .where({ productVariant: productVariantId })
      .andWhere(sql`reserved_quantity >= ${amount}`)
      .execute();

    if (result.affectedRows === 0) {
      throw new ConflictException(
        `Cannot confirm reservation for product variant ${productVariantId}: insufficient reserved quantity`,
      );
    }
  }

  async restock(productVariantId: string, amount: number): Promise<void> {
    const qb = this.em.createQueryBuilder(InventoryEntity);
    const result = await qb
      .update({
        quantity: sql`quantity + ${amount}`,
      })
      .where({ productVariant: productVariantId })
      .execute();

    if (result.affectedRows === 0) {
      throw new ConflictException(
        `Inventory not found for product variant ${productVariantId}`,
      );
    }
  }
}
