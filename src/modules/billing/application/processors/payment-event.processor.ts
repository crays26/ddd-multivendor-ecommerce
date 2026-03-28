import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { QUEUE_NAMES } from 'src/shared/ddd/infrastructure/queue/constants/queue-names';
import { CreateOrderPaymentCommand } from '../commands/create-order-payment/command';
import { CreateBillingCustomerCommand } from '../commands/create-billing-customer/command';
import { RefundOrderCommand } from '../commands/refund-order/command';
import { AccountSignedUpEvent } from 'src/modules/account/domain/events/account-signed-up.event';
import { StockConfirmationFailedEvent } from 'src/modules/inventory/domain/events/stock-confirmation-failed.event';
import { CreateRequestContext } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/postgresql';
import { EVENT_NAMES } from 'src/shared/ddd/infrastructure/queue/constants';
import { StockReservedEvent } from 'src/modules/inventory/domain/events/stock-reserved.event';
import {
  OrderResultStatus,
  StockConfirmationCompletedEvent,
} from 'src/modules/inventory/domain/events/stock-confirmation-completed.event';
import { TransferMoneyToVendorsCommand } from '../commands/transfer-money-to-vendors/command';

@Processor(QUEUE_NAMES.PAYMENT_QUEUE)
export class PaymentEventProcessor extends WorkerHost {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly orm: MikroORM,
  ) {
    super();
  }

  @CreateRequestContext()
  async process(job: Job): Promise<void> {
    switch (job.name) {
      case EVENT_NAMES.STOCK_RESERVED:
        await this.handleStockReserved(job.data as StockReservedEvent);
        break;
      case EVENT_NAMES.ACCOUNT_SIGNED_UP:
        await this.handleAccountSignedUp(job.data as AccountSignedUpEvent);
        break;
      case EVENT_NAMES.STOCK_CONFIRMATION_FAILED:
        await this.handleStockConfirmationFailed(
          job.data as StockConfirmationFailedEvent,
        );
        break;
      case EVENT_NAMES.STOCK_CONFIRMATION_COMPLETED:
        await this.handleStockConfirmationCompleted(
          job.data as StockConfirmationCompletedEvent,
        );
        break;
      default:
        break;
    }
  }

  private async handleStockReserved(event: StockReservedEvent): Promise<void> {
    await this.commandBus.execute(
      new CreateOrderPaymentCommand({
        checkoutId: event.payload.checkoutId,
        customerId: event.payload.customerId,
        totalAmount: event.payload.totalAmount,
        orders: event.payload.orders.map((o) => ({
          orderId: o.orderId,
          subtotal: o.subtotal,
        })),
      }),
    );
  }

  private async handleAccountSignedUp(
    event: AccountSignedUpEvent,
  ): Promise<void> {
    await this.commandBus.execute(
      new CreateBillingCustomerCommand({
        accountId: event.accountId,
        email: event.email,
      }),
    );
  }

  private async handleStockConfirmationFailed(
    event: StockConfirmationFailedEvent,
  ): Promise<void> {
    await this.commandBus.execute(
      new RefundOrderCommand({
        orderId: event.payload.orderId,
        vendorId: event.payload.vendorId,
        transactionId: event.payload.transactionId,
        amount: event.payload.amount,
        reason: event.payload.reason,
      }),
    );
  }

  private async handleStockConfirmationCompleted(
    event: StockConfirmationCompletedEvent,
  ): Promise<void> {
    const { checkoutId, transactionId, orderResults, customerId, totalAmount } =
      event.payload;
    const failedOrders = orderResults.filter(
      (order) => order.status === OrderResultStatus.FAILED,
    );
    const successOrders = orderResults.filter(
      (order) => order.status === OrderResultStatus.SUCCEEDED,
    );
    if (failedOrders.length > 0) {
      await Promise.all(
        failedOrders.map((order) =>
          this.commandBus.execute(
            new RefundOrderCommand({
              orderId: order.orderId,
              vendorId: order.vendorId,
              transactionId: transactionId,
              amount: order.subtotal,
              reason: 'Stock confirmation failed',
            }),
          ),
        ),
      );
    }

    if (successOrders.length > 0) {
      await this.commandBus.execute(
        new TransferMoneyToVendorsCommand({
          checkoutId,
          transactionId,
          totalAmount,
          customerId,
          orders: successOrders.map((order) => ({
            orderId: order.orderId,
            vendorId: order.vendorId,
            subtotal: order.subtotal,
          })),
        }),
      );
    }
  }
}
