import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CreateRequestContext, MikroORM } from '@mikro-orm/core';
import { CheckoutEntity } from 'src/modules/order/infrastructure/entities/checkout.entity';
import { CheckoutStatus } from 'src/modules/order/domain/aggregate-roots/checkout.agg-root';
import { ExpireReservationCommand } from '../commands/expire-reservation/command';

@Injectable()
export class ReservationExpiryScheduler {
  private readonly logger = new Logger(ReservationExpiryScheduler.name);
  private readonly EXPIRY_MINUTES = 15;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly em: EntityManager,
    private readonly orm: MikroORM,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  @CreateRequestContext()
  async cleanupExpiredReservations(): Promise<void> {
    const cutoff = new Date(Date.now() - this.EXPIRY_MINUTES * 60 * 1000);

    const expiredCheckouts = await this.em.find(CheckoutEntity, {
      status: CheckoutStatus.STOCK_RESERVED,
      createdAt: { $lt: cutoff },
    });

    if (expiredCheckouts.length === 0) return;

    this.logger.warn(
      `Found ${expiredCheckouts.length} expired reservations. Processing cleanup...`,
    );

    for (const checkout of expiredCheckouts) {
      try {
        await this.commandBus.execute(
          new ExpireReservationCommand(checkout.id),
        );
        this.logger.log(`Expired reservation for checkout ${checkout.id}`);
      } catch (error: any) {
        this.logger.error(
          `Failed to expire checkout ${checkout.id}: ${error.message}`,
        );
      }
    }
  }
}
