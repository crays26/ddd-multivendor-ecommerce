import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject } from '@nestjs/common';
import { CreateOrderPaymentCommand } from './command';
import { TransactionAggRoot } from 'src/modules/billing/domain/aggregate-roots/transaction.agg-root';
import {
  IBillingCustomerRepository,
  BILLING_CUSTOMER_REPO,
} from 'src/modules/billing/domain/repositories/billing-customer.repo.interface';
import {
  ITransactionRepository,
  TRANSACTION_REPO,
} from 'src/modules/billing/domain/repositories/transaction.repo.interface';
import {
  IBillingProvider,
  BILLING_PROVIDER,
} from 'src/modules/billing/infrastructure/external/billing.provider.interface';
import { Transactional } from '@mikro-orm/core';

export interface CreateOrderPaymentResult {
  transactionId: string;
  clientSecret: string;
}

@CommandHandler(CreateOrderPaymentCommand)
export class CreateOrderPaymentCommandHandler
  implements ICommandHandler<CreateOrderPaymentCommand>
{
  constructor(
    @Inject(BILLING_CUSTOMER_REPO)
    private readonly billingCustomerRepo: IBillingCustomerRepository,
    @Inject(TRANSACTION_REPO)
    private readonly transactionRepo: ITransactionRepository,
    @Inject(BILLING_PROVIDER)
    private readonly billingProvider: IBillingProvider,
  ) {}

  @Transactional()
  async execute(
    command: CreateOrderPaymentCommand,
  ): Promise<CreateOrderPaymentResult> {
    const {
      checkoutId,
      customerId,
      totalAmount,
      currency = 'usd',
      orders,
    } = command.payload;

    const billingCustomer =
      await this.billingCustomerRepo.findByAccountId(customerId);

    if (!billingCustomer || !billingCustomer.getProviderCustomerId()) {
      throw new BadRequestException(
        'Billing customer not found. Please ensure your account is fully set up.',
      );
    }

    const transaction = TransactionAggRoot.create({
      checkoutId,
      amount: totalAmount,
      currency,
      billingCustomerId: billingCustomer.getId(),
    });

    for (const order of orders) {
      transaction.addSubTransaction(order.orderId, order.subtotal);
    }

    const paymentIntentResult = await this.billingProvider.createPaymentIntent({
      amount: totalAmount,
      currency,
      customerId: billingCustomer.getProviderCustomerId()!,
      transferGroup: checkoutId,
      metadata: {
        checkoutId,
        transactionId: transaction.getId(),
        customerId: billingCustomer.getId(),
      },
    });

    transaction.setProviderIntent(
      paymentIntentResult.providerIntentId,
      paymentIntentResult.clientSecret,
      paymentIntentResult.status,
      paymentIntentResult.paymentMethod,
    );

    await this.transactionRepo.insert(transaction);

    return {
      transactionId: transaction.getId(),
      clientSecret: paymentIntentResult.clientSecret!,
    };
  }
}
