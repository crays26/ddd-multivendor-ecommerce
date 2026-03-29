import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import {
  ITransactionRepository,
  TRANSACTION_REPO,
} from '../../domain/repositories/transaction.repo.interface';
import {
  IBillingCustomerRepository,
  BILLING_CUSTOMER_REPO,
} from '../../domain/repositories/billing-customer.repo.interface';
import {
  IOrderPublicService,
  ORDER_PUBLIC_SERVICE,
} from 'src/modules/order/application/public-services/order.public-service.interface';
import { OutboxRepository } from 'src/shared/ddd/infrastructure/outbox/outbox.repo';
import { Status } from 'src/shared/ddd/infrastructure/outbox/outbox.entity';
import { v7 as uuidV7 } from 'uuid';
import { CreateRequestContext, Transactional } from '@mikro-orm/core';
import { PaymentSucceededEvent } from '../../domain/events/payment-succeeded.event';
import { PaymentFailedEvent } from '../../domain/events/payment-failed.event';
import Stripe from 'stripe';
import { CommandBus } from '@nestjs/cqrs';
import { ProcessPaymentSuccessCommand } from '../commands/process-payment-success/command';
import { instanceToPlain } from 'class-transformer';
import { MikroORM } from '@mikro-orm/postgresql';

@Injectable()
export class BillingWebhookService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(
    @Inject(TRANSACTION_REPO)
    private readonly transactionRepository: ITransactionRepository,
    @Inject(BILLING_CUSTOMER_REPO)
    private readonly billingCustomerRepository: IBillingCustomerRepository,
    @Inject(ORDER_PUBLIC_SERVICE)
    private readonly orderPublicService: IOrderPublicService,
    private readonly outboxRepository: OutboxRepository,
    private readonly commandBus: CommandBus,
    private readonly orm: MikroORM,
  ) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    if (!secretKey) {
      throw new InternalServerErrorException('STRIPE_SECRET_KEY is missing');
    }
    if (!this.webhookSecret) {
      throw new InternalServerErrorException(
        'STRIPE_WEBHOOK_SECRET is missing',
      );
    }
    this.stripe = new Stripe(secretKey);
  }

  @CreateRequestContext()
  async handleStripeWebhook(
    rawBody: Buffer,
    signature?: string,
  ): Promise<void> {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.webhookSecret,
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event);
        break;
      default:
        break;
    }
  }

  private async handlePaymentSucceeded(event: Stripe.Event): Promise<void> {
    const intent = event.data.object as Stripe.PaymentIntent;
    await this.commandBus.execute(new ProcessPaymentSuccessCommand(intent.id));
  }
}
