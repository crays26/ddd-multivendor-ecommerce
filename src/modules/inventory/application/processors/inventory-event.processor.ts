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
import { CreateRequestContext, MikroORM } from '@mikro-orm/postgresql';

@Processor(QUEUE_NAMES.INVENTORY_QUEUE)
export class InventoryEventProcessor extends WorkerHost {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly orm: MikroORM,
  ) {
    super();
  }

  @CreateRequestContext()
  async process(job: Job): Promise<void> {
    console.log(job.name);
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
    await this.commandBus.execute(
      new CreateInventoryCommand(
        event.payload.variants.map((v) => ({
          productVariantId: v.id,
          quantity: v.stock,
        })),
      ),
    );
  }

  private async handleCheckoutCreated(
    event: CheckoutCreatedEvent,
  ): Promise<void> {
    await this.commandBus.execute(
      new ReserveStockCommand({
        orders: event.payload.orders.map((order) => ({
          orderId: order.orderId,
          vendorId: order.vendorId,
          items: order.items,
          subtotal: order.subtotal,
        })),
        checkoutId: event.payload.checkoutId,
        customerId: event.payload.customerId,
        totalAmount: event.payload.totalAmount,
      }),
    );
  }

  private async handlePaymentSucceeded(
    event: PaymentSucceededEvent,
  ): Promise<void> {
    await this.commandBus.execute(
      new ConfirmReservationCommand({
        orders: event.payload.orders,
        checkoutId: event.payload.checkoutId,
        transactionId: event.payload.transactionId,
        customerId: event.payload.customerId,
        totalAmount: event.payload.totalAmount,
      }),
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
