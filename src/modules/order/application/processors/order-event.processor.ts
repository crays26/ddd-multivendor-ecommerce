import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { QUEUE_NAMES } from 'src/shared/ddd/infrastructure/queue/constants/queue-names';
import { EVENT_NAMES } from 'src/shared/ddd/infrastructure/queue/constants';
import { StockReservationFailedEvent } from 'src/modules/inventory/domain/events/stock-reservation-failed.event';
import { CreateRequestContext, MikroORM } from '@mikro-orm/postgresql';
import { StockReservedEvent } from 'src/modules/inventory/domain/events/stock-reserved.event';
import { StockConfirmationCompletedEvent } from 'src/modules/inventory/domain/events/stock-confirmation-completed.event';
import { UpdateOrdersStatusFromStockCommand } from '../commands/update-orders-status-from-stock/command';
import { MarkCheckoutStockReservedCommand } from '../commands/mark-checkout-stock-reserved/command';
import { ExpireReservationCommand } from '../commands/expire-reservation/command';
import { PaymentSucceededEvent } from 'src/modules/billing/domain/events/payment-succeeded.event';
import { MarkCheckoutPaidCommand } from '../commands/mark-checkout-paid/command';
import { MarkCheckoutFailedCommand } from '../commands/mark-checkout-failed/command';

@Processor(QUEUE_NAMES.ORDER_QUEUE)
export class OrderEventProcessor extends WorkerHost {
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
      case EVENT_NAMES.PAYMENT_SUCCEEDED:
        await this.handlePaymentSucceeded(job.data as PaymentSucceededEvent);
        break;
      case EVENT_NAMES.INSUFFICIENT_STOCK:
        await this.handleInsufficientStock(
          job.data as StockReservationFailedEvent,
        );
        break;
      case EVENT_NAMES.STOCK_CONFIRMATION_COMPLETED:
        await this.handleStockConfirmationCompleted(
          job.data as StockConfirmationCompletedEvent,
        );
        break;
      case EVENT_NAMES.CHECK_RESERVATION_EXPIRY:
        await this.handleReservationExpiry(job.data as { checkoutId: string });
        break;
      default:
        break;
    }
  }

  private async handleStockReserved(event: StockReservedEvent): Promise<void> {
    await this.commandBus.execute(
      new MarkCheckoutStockReservedCommand({
        checkoutId: event.payload.checkoutId,
        orders: event.payload.orders,
        customerId: event.payload.customerId,
        totalAmount: event.payload.totalAmount,
      }),
    );
  }

  private async handleInsufficientStock(
    event: StockReservationFailedEvent,
  ): Promise<void> {
    await this.commandBus.execute(
      new MarkCheckoutFailedCommand(event.payload.checkoutId),
    );
  }

  private async handlePaymentSucceeded(
    event: PaymentSucceededEvent,
  ): Promise<void> {
    await this.commandBus.execute(
      new MarkCheckoutPaidCommand(event.payload.checkoutId),
    );
  }

  private async handleStockConfirmationCompleted(
    event: StockConfirmationCompletedEvent,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateOrdersStatusFromStockCommand({
        checkoutId: event.payload.checkoutId,
        orderResults: event.payload.orderResults,
      }),
    );
  }

  private async handleReservationExpiry(data: {
    checkoutId: string;
  }): Promise<void> {
    await this.commandBus.execute(
      new ExpireReservationCommand(data.checkoutId),
    );
  }
}
