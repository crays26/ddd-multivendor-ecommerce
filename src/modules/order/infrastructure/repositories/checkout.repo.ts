import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { CheckoutAggRoot } from 'src/modules/order/domain/aggregate-roots/checkout.agg-root';
import { CheckoutEntity } from 'src/modules/order/infrastructure/entities/checkout.entity';
import { AccountEntity } from 'src/modules/account/infrastructure/entities/account.entity';
import { CustomerIdVO } from 'src/modules/order/domain/value-objects/customer-id.vo';

@Injectable()
export class CheckoutRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<CheckoutAggRoot | null> {
    const entity = await this.em.findOne(CheckoutEntity, { id });

    if (!entity) return null;

    return CheckoutAggRoot.rehydrate({
      id: entity.id,
      customerId: CustomerIdVO.create({ id: entity.customer.id }),
      status: entity.status,
      totalAmount: entity.totalAmount,
      paymentDueAt: entity.paymentDueAt,
    });
  }

  async insert(aggregate: CheckoutAggRoot): Promise<void> {
    const entity = new CheckoutEntity();
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

  async update(aggregate: CheckoutAggRoot): Promise<void> {
    const entity = await this.em.findOneOrFail(CheckoutEntity, {
      id: aggregate.getId(),
    });

    entity.status = aggregate.getStatus();
    entity.totalAmount = aggregate.getTotalAmount();
    entity.paymentDueAt = aggregate.getPaymentDueAt();

    this.em.persist(entity);
  }
}
