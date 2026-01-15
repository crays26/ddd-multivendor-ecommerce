import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager, sql } from '@mikro-orm/postgresql';
import { InventoryEntity } from '../entities/inventory.entity';
import { InventoryAggRoot } from '../../domain/aggregate-roots/inventory.agg-root';
import { IInventoryRepository } from '../../domain/repositories/inventory.repo.interface';
import { InventoryDomainMapper } from '../mappers/inventory.mapper';

@Injectable()
export class InventoryRepository implements IInventoryRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<InventoryAggRoot | null> {
    const entity = await this.em.findOne(InventoryEntity, { id });
    if (!entity) return null;
    return InventoryDomainMapper.fromPersistence(entity);
  }

  async findByVariantId(variantId: string): Promise<InventoryAggRoot | null> {
    const entity = await this.em.findOne(InventoryEntity, { variantId });
    if (!entity) return null;
    return InventoryDomainMapper.fromPersistence(entity);
  }

  async findByVariantIds(variantIds: string[]): Promise<InventoryAggRoot[]> {
    const entities = await this.em.find(InventoryEntity, {
      variantId: { $in: variantIds },
    });
    return entities.map((e) => InventoryDomainMapper.fromPersistence(e));
  }

  async insert(aggregate: InventoryAggRoot): Promise<void> {
    const entity = new InventoryEntity();
    InventoryDomainMapper.toPersistence(aggregate, entity);
    await this.em.persistAndFlush(entity);
  }

  async update(aggregate: InventoryAggRoot): Promise<void> {
    const entity = await this.em.findOneOrFail(InventoryEntity, {
      id: aggregate.getId(),
    });
    InventoryDomainMapper.toPersistence(aggregate, entity);
    await this.em.persistAndFlush(entity);
  }

  async reserveStock(variantId: string, amount: number): Promise<void> {
    const qb = this.em.createQueryBuilder(InventoryEntity);
    const result = await qb
      .update({
        reservedQuantity: sql`reserved_quantity + ${amount}`,
      })
      .where({ variantId })
      .andWhere(sql`quantity - reserved_quantity >= ${amount}`)
      .execute();

    if (result.affectedRows === 0) {
      throw new ConflictException(
        `Insufficient stock for variant ${variantId}`,
      );
    }
  }

  async releaseStock(variantId: string, amount: number): Promise<void> {
    const qb = this.em.createQueryBuilder(InventoryEntity);
    const result = await qb
      .update({
        reservedQuantity: sql`reserved_quantity - ${amount}`,
      })
      .where({ variantId })
      .andWhere(sql`reserved_quantity >= ${amount}`)
      .execute();

    if (result.affectedRows === 0) {
      throw new ConflictException(
        `Cannot release stock for variant ${variantId}: insufficient reserved quantity`,
      );
    }
  }

  async confirmReservation(variantId: string, amount: number): Promise<void> {
    const qb = this.em.createQueryBuilder(InventoryEntity);
    const result = await qb
      .update({
        quantity: sql`quantity - ${amount}`,
        reservedQuantity: sql`reserved_quantity - ${amount}`,
      })
      .where({ variantId })
      .andWhere(sql`reserved_quantity >= ${amount}`)
      .execute();

    if (result.affectedRows === 0) {
      throw new ConflictException(
        `Cannot confirm reservation for variant ${variantId}: insufficient reserved quantity`,
      );
    }
  }

  async restock(variantId: string, amount: number): Promise<void> {
    const qb = this.em.createQueryBuilder(InventoryEntity);
    const result = await qb
      .update({
        quantity: sql`quantity + ${amount}`,
      })
      .where({ variantId })
      .execute();

    if (result.affectedRows === 0) {
      throw new ConflictException(
        `Inventory not found for variant ${variantId}`,
      );
    }
  }
}
