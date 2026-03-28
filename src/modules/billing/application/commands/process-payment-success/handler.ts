import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Transactional } from '@mikro-orm/core';
import { ProcessPaymentSuccessCommand } from './command';
import {
  ITransactionRepository,
  TRANSACTION_REPO,
} from 'src/modules/billing/domain/repositories/transaction.repo.interface';
import {
  IOrderPublicService,
  ORDER_PUBLIC_SERVICE,
} from 'src/modules/order/application/public-services/order.public-service.interface';
import { OutboxRepository } from 'src/shared/ddd/infrastructure/outbox/outbox.repo';
import { v7 as uuidV7 } from 'uuid';
import { Status } from 'src/shared/ddd/infrastructure/outbox/outbox.entity';
import { instanceToPlain } from 'class-transformer';
import { PaymentSucceededEvent } from '../../../domain/events/payment-succeeded.event';

@CommandHandler(ProcessPaymentSuccessCommand)
export class ProcessPaymentSuccessHandler
  implements ICommandHandler<ProcessPaymentSuccessCommand>
{
  constructor(
    @Inject(TRANSACTION_REPO)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(ORDER_PUBLIC_SERVICE)
    private readonly orderPublicService: IOrderPublicService,
    private readonly outboxRepository: OutboxRepository,
  ) {}

  @Transactional()
  async execute(command: ProcessPaymentSuccessCommand): Promise<void> {
    const { paymentIntentId } = command;

    const tx =
      await this.transactionRepository.findByProviderIntentId(paymentIntentId);
    if (!tx) {
      console.log(
        `Transaction for providerIntentId ${paymentIntentId} not found`,
      );
      return;
    }

    if (tx.getStatus() === 'succeeded') {
      console.log(`Transaction ${tx.getId()} is already succeeded`);
      return;
    }

    tx.markSucceeded();
    for (const subtx of tx.getSubTransactions()) {
      subtx.markSucceeded();
    }
    await this.transactionRepository.update(tx);

    const orders = await this.orderPublicService.getOrdersByCheckoutId(
      tx.getCheckoutId(),
    );

    const paymentEvent = new PaymentSucceededEvent({
      checkoutId: tx.getCheckoutId(),
      transactionId: tx.getId(),
      orders,
      customerId: tx.getBillingCustomerId()!,
      totalAmount: tx.getAmount(),
    });

    await this.outboxRepository.save({
      id: uuidV7(),
      name: paymentEvent.constructor.name,
      payload: instanceToPlain(paymentEvent),
      status: Status.PENDING,
    });

    console.log(`Payment success processed for transaction ${tx.getId()}`);
  }
}
