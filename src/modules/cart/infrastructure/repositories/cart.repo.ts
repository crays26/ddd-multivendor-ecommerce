import { ICartRepository } from 'src/modules/cart/domain/repositories/cart.repo.interface';
import { CartAggRoot } from 'src/modules/cart/domain/aggregate-roots/cart.agg-root';
import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { CartEntity } from '../entities/cart.entity';
import { CartDomainMapper } from '../mappers/cart.mapper';
import { AccountEntity } from 'src/modules/account/infrastructure/entities/account.entity';
import { CartItemEntity } from '../entities/cart-item.entity';
import { ProductVariantEntity } from 'src/modules/product/infrastructure/entities/product-variant.entity';

@Injectable()
export class CartRepository implements ICartRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<CartAggRoot | null> {
    const cart = await this.em.findOne(
      CartEntity,
      { id },
      { populate: ['items.productVariant'] },
    );

    return cart ? CartDomainMapper.fromPersistence(cart) : null;
  }

  async findByCustomerId(customerId: string): Promise<CartAggRoot | null> {
    const cart = await this.em.findOne(
      CartEntity,
      { customer: { id: customerId } },
      { populate: ['items.productVariant'] },
    );

    return cart ? CartDomainMapper.fromPersistence(cart) : null;
  }

  async insert(entity: CartAggRoot): Promise<void> {
    const newCart = new CartEntity();
    newCart.id = entity.getId();
    newCart.customer = this.em.getReference(
      AccountEntity,
      entity.getCustomerId(),
    );
    this.upsertItems(entity, newCart);
    this.em.persist(newCart);
  }

  async update(domain: CartAggRoot): Promise<void> {
    let cart = await this.em.findOneOrFail(
      CartEntity,
      { id: domain.getId() },
      { populate: ['items'] },
    );
    this.upsertItems(domain, cart);
    this.removeUnusedItems(domain, cart);
    this.em.persist(cart);
  }

  // private methods

  private upsertItems(aggregate: CartAggRoot, entity: CartEntity): void {
    const existingItems = entity.items.getItems();

    for (const item of aggregate.getItems()) {
      let itemEntity = existingItems.find((i) => i.id === item.getId());
      if (!itemEntity) {
        itemEntity = new CartItemEntity();
        itemEntity.id = item.getId();
        entity.items.add(itemEntity);
      }
      itemEntity.productVariant = this.em.getReference(
        ProductVariantEntity,
        item.getProductVariantId(),
      );
      itemEntity.quantity = item.getQuantity();
    }
  }

  private removeUnusedItems(aggregate: CartAggRoot, entity: CartEntity): void {
    const domainIds = aggregate.getItems().map((i) => i.getId());
    const existingItems = entity.items.getItems();
    const itemsToRemove = existingItems.filter(
      (item) => !domainIds.includes(item.id),
    );
    if (itemsToRemove.length > 0) {
      entity.items.remove(itemsToRemove);
    }
  }
}
