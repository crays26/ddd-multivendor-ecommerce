import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { OrderGroupAggRoot } from 'src/modules/order/domain/aggregate-roots/order-group.agg-root';
import { OrderGroupEntity } from 'src/modules/order/infrastructure/entities/order-group.entity';
import { AccountEntity } from 'src/modules/account/infrastructure/entities/account.entity';
import { CustomerIdVO } from 'src/modules/order/domain/value-objects/customer-id.vo';

@Injectable()
export class OrderGroupRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<OrderGroupAggRoot | null> {
    const entity = await this.em.findOne(OrderGroupEntity, { id });

    if (!entity) return null;

    return OrderGroupAggRoot.rehydrate({
      id: entity.id,
      customerId: CustomerIdVO.create({ id: entity.customer.id }),
      status: entity.status,
      totalAmount: entity.totalAmount,
      paymentDueAt: entity.paymentDueAt,
    });
  }

  async insert(aggregate: OrderGroupAggRoot): Promise<void> {
    const entity = new OrderGroupEntity();
    entity.id = aggregate.getId();
    entity.customer = this.em.getReference(
      AccountEntity,
      aggregate.getCustomerId(),
    );
    entity.status = aggregate.getStatus();
    entity.totalAmount = aggregate.getTotalAmount();
    entity.paymentDueAt = aggregate.getPaymentDueAt();

    this.em.persist(entity);
  }

  async update(aggregate: OrderGroupAggRoot): Promise<void> {
    const entity = await this.em.findOneOrFail(OrderGroupEntity, {
      id: aggregate.getId(),
    });

    entity.status = aggregate.getStatus();
    entity.totalAmount = aggregate.getTotalAmount();
    entity.paymentDueAt = aggregate.getPaymentDueAt();

    this.em.persist(entity);
  }
}
