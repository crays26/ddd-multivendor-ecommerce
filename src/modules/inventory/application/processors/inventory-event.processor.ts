import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { QUEUE_NAMES } from 'src/shared/ddd/infrastructure/queue/constants/queue-names';
import { EVENT_NAMES } from 'src/shared/ddd/infrastructure/queue/constants';
import { PaymentSucceededEvent } from 'src/modules/billing/domain/events/payment-succeeded.event';
import { PaymentFailedEvent } from 'src/modules/billing/domain/events/payment-failed.event';
import { ConfirmReservationCommand } from '../commands/confirm-reservation/command';
import { ReleaseStockCommand } from '../commands/release-stock/command';
import { ProductCreatedEvent } from 'src/modules/product/domain/events/product-created.event';
import { CreateInventoryCommand } from '../commands/create-inventory/command';
import { CheckoutCreatedEvent } from 'src/modules/order/domain/events/checkout-created.event';
import { ReserveStockCommand } from '../commands/reserve-stock/command';

@Processor(QUEUE_NAMES.INVENTORY_QUEUE)
export class InventoryEventProcessor extends WorkerHost {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case EVENT_NAMES.PRODUCT_CREATED:
        await this.handleProductCreated(job.data as ProductCreatedEvent);
        break;
      case EVENT_NAMES.PAYMENT_SUCCEEDED:
        await this.handlePaymentSucceeded(job.data as PaymentSucceededEvent);
        break;
      case EVENT_NAMES.CHECKOUT_CREATED:
        await this.handleCheckoutCreated(job.data as CheckoutCreatedEvent);
        break;
      case EVENT_NAMES.PAYMENT_FAILED:
        await this.handlePaymentFailed(job.data as PaymentFailedEvent);
        break;
      default:
        break;
    }
  }

  private async handleProductCreated(
    event: ProductCreatedEvent,
  ): Promise<void> {
    await Promise.all(
      event.props.variants.map((variant) =>
        this.commandBus.execute(
          new CreateInventoryCommand(variant.id, variant.stock),
        ),
      ),
    );
  }

  private async handleCheckoutCreated(
    event: CheckoutCreatedEvent,
  ): Promise<void> {
    await Promise.all(
      event.orders.map((order) =>
        this.commandBus.execute(
          new ReserveStockCommand({
            orderId: order.orderId,
            vendorId: order.vendorId,
            checkoutId: event.checkoutId,
            items: order.items,
            amount: order.subtotal,
          }),
        ),
      ),
    );
  }

  private async handlePaymentSucceeded(
    event: PaymentSucceededEvent,
  ): Promise<void> {
    await Promise.allSettled(
      event.orders.map((order) =>
        this.commandBus.execute(
          new ConfirmReservationCommand({
            orderId: order.orderId,
            vendorId: order.vendorId,
            checkoutId: event.checkoutId,
            items: order.items,
            amount: order.subtotal,
          }),
        ),
      ),
    );
  }

  private async handlePaymentFailed(event: PaymentFailedEvent): Promise<void> {
    await Promise.allSettled(
      event.orders.flatMap((order) =>
        order.items.map((item) =>
          this.commandBus.execute(
            new ReleaseStockCommand({
              variantId: item.variantId,
              quantity: item.quantity,
            }),
          ),
        ),
      ),
    );
  }
}
