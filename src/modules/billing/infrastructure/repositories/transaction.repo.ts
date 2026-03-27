import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { TransactionAggRoot } from '../../domain/aggregate-roots/transaction.agg-root';
import { ITransactionRepository } from '../../domain/repositories/transaction.repo.interface';
import { TransactionDomainMapper } from '../mappers/transaction.mapper';
import { TransactionEntity } from '../entities/transaction.entity';
import { BillingCustomerEntity } from '../entities/billing-customer.entity';
import { CheckoutEntity } from 'src/modules/order/infrastructure/entities/checkout.entity';
import { SubtransactionEntity } from '../entities/subtransaction.entity';
import { OrderEntity } from 'src/modules/order/infrastructure/entities/order.entity';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(private readonly em: EntityManager) {}

  async insert(domain: TransactionAggRoot): Promise<void> {
    const entity = new TransactionEntity();
    entity.id = domain.getId();
    this.mapAggregateToEntity(domain, entity);

    this.upsertSubtransactions(domain, entity);
    this.removeUnusedSubtransactions(domain, entity);

    await this.em.persist(entity).flush();
  }

  async update(domain: TransactionAggRoot): Promise<void> {
    const entity = await this.em.findOneOrFail(TransactionEntity, {
      id: domain.getId(),
    });
    this.mapAggregateToEntity(domain, entity);
    this.upsertSubtransactions(domain, entity);
    this.removeUnusedSubtransactions(domain, entity);

    await this.em.flush();
  }

  async findById(id: string): Promise<TransactionAggRoot | null> {
    const entity = await this.em.findOne(
      TransactionEntity,
      { id },
      { populate: ['checkout', 'subtransactions'] },
    );
    if (!entity) return null;
    return TransactionDomainMapper.fromPersistence(entity);
  }

  async findByProviderIntentId(id: string): Promise<TransactionAggRoot | null> {
    const entity = await this.em.findOne(
      TransactionEntity,
      {
        providerIntentId: id,
      },
      { populate: ['checkout', 'subtransactions'] },
    );
    if (!entity) return null;
    return TransactionDomainMapper.fromPersistence(entity);
  }

  private mapAggregateToEntity(
    domain: TransactionAggRoot,
    entity: TransactionEntity,
  ) {
    entity.status = domain.getStatus();
    entity.providerIntentId = domain.getProviderIntentId();
    entity.clientSecret = domain.getClientSecret();
    entity.paymentMethod = domain.getPaymentMethod();
    entity.amount = domain.getAmount();
    entity.provider = domain.getProvider();
    entity.currency = domain.getCurrency();
    entity.checkout = this.em.getReference(
      CheckoutEntity,
      domain.getCheckoutId(),
    );
    entity.billingCustomer = this.em.getReference(
      BillingCustomerEntity,
      domain.getBillingCustomerId()!,
    );
  }

  private upsertSubtransactions(
    domain: TransactionAggRoot,
    entity: TransactionEntity,
  ) {
    const subtransactions = entity.subtransactions.getItems();
    for (const subtx of domain.getSubTransactions()) {
      let entity = subtransactions.find(
        (entitySubtx) => subtx.getId() === entitySubtx.id,
      );
      if (!entity) {
        entity = new SubtransactionEntity();
      }
      entity.status = subtx.getStatus();
      entity.amount = subtx.getAmount();
      entity.order = this.em.getReference(OrderEntity, subtx.getOrderId());
      entity.transferId = subtx.getTransferId();
    }
  }

  private removeUnusedSubtransactions(
    domain: TransactionAggRoot,
    entity: TransactionEntity,
  ) {
    const entitySubtransactions = entity.subtransactions.getItems();
    const domainSubtransactionIds = domain
      .getSubTransactions()
      .map((subtx) => subtx.getId());

    const subtransactionsToRemove = entitySubtransactions.filter(
      (subtx) => !domainSubtransactionIds.includes(subtx.id),
    );
    this.em.remove(subtransactionsToRemove);
  }
}
