import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { IOrderRepository } from 'src/modules/order/domain/repositories/order.repo.interface';
import { OrderAggRoot } from 'src/modules/order/domain/aggregate-roots/order.agg-root';
import { OrderEntity } from 'src/modules/order/infrastructure/entities/order.entity';
import { AccountEntity } from 'src/modules/account/infrastructure/entities/account.entity';
import { VendorEntity } from 'src/modules/vendor/infrastructure/entities/vendor.entity';
import { OrderLineItemEntity } from 'src/modules/order/infrastructure/entities/order-line-item.entity';
import { ProductVariantEntity } from 'src/modules/product/infrastructure/entities/product-variant.entity';
import { OrderDomainMapper } from 'src/modules/order/infrastructure/mappers/order.mapper';
import { OrderLineItem } from 'src/modules/order/domain/entities/order-line-item.entity';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<OrderAggRoot | null> {
    const entity: OrderEntity | null = await this.em.findOne(
      OrderEntity,
      { id },
      { populate: ['lineItems'] },
    );
    return entity ? OrderDomainMapper.fromPersistence(entity) : null;
  }

  async insert(aggregate: OrderAggRoot): Promise<void> {
    const entity = new OrderEntity();
    entity.id = aggregate.getId();

    this.mapAggregateToEntity(aggregate, entity);
    this.upsertLineItems(aggregate, entity);
    this.em.persist(entity);
  }

  async update(aggregate: OrderAggRoot): Promise<void> {
    const entity = await this.em.findOneOrFail(
      OrderEntity,
      { id: aggregate.getId() },
      { populate: ['lineItems'] },
    );
    this.mapAggregateToEntity(aggregate, entity);
    this.removeUnusedLineItems(aggregate, entity);
    this.upsertLineItems(aggregate, entity);

    this.em.persist(entity);
  }

  // Private Helpers

  private mapAggregateToEntity(
    aggregate: OrderAggRoot,
    entity: OrderEntity,
  ): void {
    entity.totalAmount = aggregate.getTotalAmount();
    entity.status = aggregate.getStatus();
    entity.customer = this.em.getReference(
      AccountEntity,
      aggregate.getCustomerId(),
    );
    entity.vendor = this.em.getReference(VendorEntity, aggregate.getVendorId());
  }

  private mapLineItemToEntity(
    domainItem: OrderLineItem,
    entityItem: OrderLineItemEntity,
  ): void {
    entityItem.price = domainItem.getPriceAtPurchase();
    entityItem.quantity = domainItem.getQuantity();

    if (entityItem.productVariant?.id !== domainItem.getProductVariantId()) {
      entityItem.productVariant = this.em.getReference(
        ProductVariantEntity,
        domainItem.getProductVariantId(),
      );
    }
  }

  private removeUnusedLineItems(
    aggregate: OrderAggRoot,
    entity: OrderEntity,
  ): void {
    const domainIds = aggregate.getOrderItems().map((i) => i.getId());
    const existingItems = entity.lineItems.getItems();

    const itemsToRemove = existingItems.filter(
      (item) => !domainIds.includes(item.id),
    );

    if (itemsToRemove.length > 0) {
      entity.lineItems.remove(itemsToRemove);
    }
  }

  private upsertLineItems(aggregate: OrderAggRoot, entity: OrderEntity): void {
    const existingItems = entity.lineItems.getItems();

    for (const domainItem of aggregate.getOrderItems()) {
      let entityItem = existingItems.find((i) => i.id === domainItem.getId());

      if (!entityItem) {
        entityItem = new OrderLineItemEntity();
        entityItem.id = domainItem.getId();
        entity.lineItems.add(entityItem);
      }
      this.mapLineItemToEntity(domainItem, entityItem);
    }
  }
}
