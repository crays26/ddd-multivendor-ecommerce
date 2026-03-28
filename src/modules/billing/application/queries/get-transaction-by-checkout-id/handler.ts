import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTransactionByCheckoutIdQuery } from './query';
import { EntityManager } from '@mikro-orm/postgresql';
import { TransactionEntity } from '../../../infrastructure/entities/transaction.entity';
import { GetTransactionByCheckoutIdDto } from './dto';

@QueryHandler(GetTransactionByCheckoutIdQuery)
export class GetTransactionByCheckoutIdQueryHandler
  implements
    IQueryHandler<
      GetTransactionByCheckoutIdQuery,
      GetTransactionByCheckoutIdDto | null
    >
{
  constructor(private readonly em: EntityManager) {}

  async execute(
    query: GetTransactionByCheckoutIdQuery,
  ): Promise<GetTransactionByCheckoutIdDto | null> {
    const transaction = await this.em.findOne(
      TransactionEntity,
      { checkout: query.checkoutId },
      { populate: ['checkout'] },
    );

    if (!transaction) return null;

    return {
      id: transaction.id,
      checkoutId: transaction.checkout.id,
      amount: transaction.amount,
      currency: transaction.currency,
      provider: transaction.provider,
      status: transaction.status,
      providerIntentId: transaction.providerIntentId,
      clientSecret: transaction.clientSecret,
      paymentMethod: transaction.paymentMethod,
    };
  }
}
