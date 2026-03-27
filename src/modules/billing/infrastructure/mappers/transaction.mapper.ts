import {
  TransactionAggRoot,
  TransactionProvider,
} from '../../domain/aggregate-roots/transaction.agg-root';
import { SubTransaction } from '../../domain/entities/sub-transaction.entity';
import { CheckoutIdVO } from '../../domain/value-objects/checkout-id.vo';
import { OrderIdVO } from '../../domain/value-objects/order-id.vo';
import { TransactionEntity } from '../entities/transaction.entity';

export class TransactionDomainMapper {
  static fromPersistence(entity: TransactionEntity): TransactionAggRoot {
    return TransactionAggRoot.rehydrate({
      id: entity.id,
      checkoutId: CheckoutIdVO.create({ id: entity.checkout.id }),
      amount: entity.amount,
      currency: entity.currency,
      provider: entity.provider as TransactionProvider,
      status: entity.status,
      subTransactions: entity.subtransactions.map((st) =>
        SubTransaction.rehydrate({
          id: st.id,
          amount: st.amount,
          status: st.status,
          orderId: OrderIdVO.create({ id: st.order.id }),
          transferId: st.transferId,
        }),
      ),
      providerIntentId: entity.providerIntentId,
      clientSecret: entity.clientSecret,
      paymentMethod: entity.paymentMethod,
      billingCustomerId: entity.billingCustomer?.id,
    });
  }
}
