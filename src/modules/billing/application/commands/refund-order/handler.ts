import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
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
    const { transactionId, amount, orderId, vendorId, reason } =
      command.payload;

    // Find the transaction to get the provider payment intent ID
    const transaction = await this.transactionRepo.findById(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    const providerIntentId = transaction.getProviderIntentId();
    if (!providerIntentId) {
      throw new Error(`Transaction ${transactionId} has no provider intent ID`);
    }

    // Process partial refund via Stripe
    const refundResult = await this.billingProvider.refund({
      paymentIntentId: providerIntentId,
      amount,
      reason: 'requested_by_customer',
      metadata: {
        orderId,
        vendorId,
        originalReason: reason,
      },
    });

    // TODO: Optionally create a refund record or update transaction status
    console.log(
      `Refund processed: ${refundResult.providerRefundId} for order ${orderId}`,
    );
  }
}
