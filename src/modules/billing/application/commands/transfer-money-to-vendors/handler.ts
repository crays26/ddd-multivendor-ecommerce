import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { Transactional } from '@mikro-orm/core';
import { TransferMoneyToVendorsCommand } from './command';
import {
  ITransactionRepository,
  TRANSACTION_REPO,
} from 'src/modules/billing/domain/repositories/transaction.repo.interface';
import {
  IBillingProvider,
  BILLING_PROVIDER,
} from 'src/modules/billing/infrastructure/external/billing.provider.interface';
import {
  BILLING_VENDOR_REPO,
  IBillingVendorRepository,
} from 'src/modules/billing/domain/repositories/billing-vendor.repo.interface';

@CommandHandler(TransferMoneyToVendorsCommand)
export class TransferMoneyToVendorsHandler
  implements ICommandHandler<TransferMoneyToVendorsCommand>
{
  private readonly logger = new Logger(TransferMoneyToVendorsHandler.name);
  private readonly PLATFORM_FEE_PERCENTAGE = 0.1;

  constructor(
    @Inject(TRANSACTION_REPO)
    private readonly transactionRepo: ITransactionRepository,
    @Inject(BILLING_PROVIDER)
    private readonly billingProvider: IBillingProvider,
    @Inject(BILLING_VENDOR_REPO)
    private readonly billingVendorRepo: IBillingVendorRepository,
  ) {}

  @Transactional()
  async execute(command: TransferMoneyToVendorsCommand): Promise<void> {
    const { orders, checkoutId, transactionId } = command.payload;

    const transaction = await this.transactionRepo.findById(transactionId);
    if (!transaction) {
      throw new NotFoundException(`Transaction ${transactionId} not found`);
    }

    const currency = transaction.getCurrency();

    for (const order of orders) {
      try {
        const billingVendor = await this.billingVendorRepo.findByVendorId(
          order.vendorId,
        );

        if (!billingVendor || !billingVendor.getProviderAccountId()) {
          this.logger.error(
            `Vendor ${order.vendorId} has no Stripe account linked. Skipping transfer for order ${order.orderId}.`,
          );
          transaction.updateSubTransactionStatus(order.orderId, 'failed');
          continue;
        }

        const netAmount = Math.round(
          order.subtotal * (1 - this.PLATFORM_FEE_PERCENTAGE),
        );

        await this.billingProvider.transfer({
          amount: netAmount,
          currency: currency,
          destination: billingVendor.getProviderAccountId()!,
          transferGroup: checkoutId,
          metadata: {
            transactionId,
            orderId: order.orderId,
            vendorId: order.vendorId,
          },
        });

        transaction.updateSubTransactionStatus(order.orderId, 'succeeded');
        this.logger.log(
          `Successfully transferred ${netAmount} ${currency} to vendor ${order.vendorId} for order ${order.orderId}`,
        );
      } catch (error: any) {
        this.logger.error(
          `Failed to transfer money to vendor ${order.vendorId} for order ${order.orderId}: ${error.message}`,
        );
        transaction.updateSubTransactionStatus(order.orderId, 'failed');
      }
    }

    transaction.markSucceeded();

    await this.transactionRepo.update(transaction);
  }
}
