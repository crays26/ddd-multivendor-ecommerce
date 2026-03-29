import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { RefundOrderCommand } from './command';
import {
  IBillingProvider,
  BILLING_PROVIDER,
} from 'src/modules/billing/infrastructure/external/billing.provider.interface';
import {
  ITransactionRepository,
  TRANSACTION_REPO,
} from 'src/modules/billing/domain/repositories/transaction.repo.interface';

@CommandHandler(RefundOrderCommand)
export class RefundOrderCommandHandler
  implements ICommandHandler<RefundOrderCommand>
{
  constructor(
    @Inject(BILLING_PROVIDER)
    private readonly billingProvider: IBillingProvider,
    @Inject(TRANSACTION_REPO)
    private readonly transactionRepo: ITransactionRepository,
  ) {}

  async execute(command: RefundOrderCommand): Promise<void> {
    const { transactionId, checkoutId, orders } = command.payload;

    const transaction = await this.transactionRepo.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException(`Transaction ${transactionId} not found`);
    }

    const providerIntentId = transaction.getProviderIntentId();
    if (!providerIntentId) {
      throw new NotFoundException(
        `Transaction ${transactionId} has no provider intent ID`,
      );
    }

    for (const order of orders) {
      await this.billingProvider.refund({
        paymentIntentId: providerIntentId,
        amount: order.subtotal,
        reason: 'requested_by_customer',
        metadata: {
          checkoutId,
          orderId: order.orderId,
          vendorId: order.vendorId,
        },
      });
    }
  }
}
