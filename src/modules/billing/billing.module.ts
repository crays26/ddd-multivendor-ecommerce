import { Module, OnModuleInit } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CqrsModule } from '@nestjs/cqrs';
import { TransactionEntity } from './infrastructure/entities/transaction.entity';
import { BillingCustomerEntity } from './infrastructure/entities/billing-customer.entity';
import { TransactionRepository } from './infrastructure/repositories/transaction.repo';
import { BillingCustomerRepository } from './infrastructure/repositories/billing-customer.repo';
import { CreateOrderPaymentCommandHandler } from './application/commands/create-order-payment/handler';
import { RefundOrderCommandHandler } from './application/commands/refund-order/handler';
import { StripeBillingProvider } from './infrastructure/external/stripe.billing.provider';
import { BILLING_PROVIDER } from './infrastructure/external/billing.provider.interface';
import { GetTransactionByIdHandler } from './application/queries/get-transaction-by-id/handler';
import { BillingWebhookService } from './application/services/billing-webhook.service';
import { WebhookController } from './presentation/controllers/webhook.controller';
import { PaymentEventProcessor } from './application/processors/payment-event.processor';
import { TRANSACTION_REPO } from './domain/repositories/transaction.repo.interface';
import { BILLING_CUSTOMER_REPO } from './domain/repositories/billing-customer.repo.interface';
import { ShareOutboxModule } from 'src/shared/ddd/infrastructure/outbox/outbox.module';
import { OrderModule } from 'src/modules/order/order.module';
import { CreateBillingCustomerHandler } from './application/commands/create-billing-customer/handler';
import { TransferMoneyToVendorsHandler } from './application/commands/transfer-money-to-vendors/handler';
import { ProcessPaymentSuccessHandler } from './application/commands/process-payment-success/handler';
import { EventQueueRegistry } from 'src/shared/ddd/infrastructure/queue/event-queue.registry';
import { BillingVendorEntity } from './infrastructure/entities/billing-vendor.entity';
import { BillingVendorRepository } from './infrastructure/repositories/billing-vendor.repo';
import { BILLING_VENDOR_REPO } from './domain/repositories/billing-vendor.repo.interface';
import { RegisterVendorStripeAccountHandler } from './application/commands/register-vendor-stripe-account/handler';
import { BillingVendorController } from './presentation/controllers/billing-vendor.controller';

const CommandHandlers = [
  CreateOrderPaymentCommandHandler,
  CreateBillingCustomerHandler,
  RefundOrderCommandHandler,
  TransferMoneyToVendorsHandler,
  ProcessPaymentSuccessHandler,
  RegisterVendorStripeAccountHandler,
];

const QueryHandlers = [GetTransactionByIdHandler];

@Module({
  imports: [
    MikroOrmModule.forFeature([
      TransactionEntity,
      BillingCustomerEntity,
      BillingVendorEntity,
    ]),
    CqrsModule,
    ShareOutboxModule,
    OrderModule,
  ],
  controllers: [WebhookController, BillingVendorController],
  providers: [
    {
      provide: TRANSACTION_REPO,
      useClass: TransactionRepository,
    },
    {
      provide: BILLING_CUSTOMER_REPO,
      useClass: BillingCustomerRepository,
    },
    {
      provide: BILLING_VENDOR_REPO,
      useClass: BillingVendorRepository,
    },
    {
      provide: BILLING_PROVIDER,
      useClass: StripeBillingProvider,
    },
    ...CommandHandlers,
    ...QueryHandlers,
    BillingWebhookService,
    PaymentEventProcessor,
  ],
  exports: [TRANSACTION_REPO, BILLING_CUSTOMER_REPO],
})
export class BillingModule implements OnModuleInit {
  constructor(private readonly eventRegistry: EventQueueRegistry) {}

  onModuleInit() {}
}
