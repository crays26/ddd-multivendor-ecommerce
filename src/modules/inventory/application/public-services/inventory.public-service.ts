import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ConfirmReservationPayload,
  IInventoryPublicService,
} from './inventory.public-service.interface';
import { ReserveStockCommand } from '../commands/reserve-stock/command';
import { ReleaseStockCommand } from '../commands/release-stock/command';
import { ConfirmReservationCommand } from '../commands/confirm-reservation/command';
import { GetAvailableStockQuery } from '../queries/get-available-stock/query';

@Injectable()
export class InventoryPublicService implements IInventoryPublicService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async reserveStock(variantId: string, quantity: number): Promise<void> {
    await this.commandBus.execute(
      new ReserveStockCommand({ variantId, quantity }),
    );
  }

  async releaseStock(variantId: string, quantity: number): Promise<void> {
    await this.commandBus.execute(
      new ReleaseStockCommand({ variantId, quantity }),
    );
  }

  async confirmReservation(payload: ConfirmReservationPayload): Promise<void> {
    await this.commandBus.execute(new ConfirmReservationCommand(payload));
  }

  async getAvailableStock(variantId: string): Promise<number> {
    return await this.queryBus.execute(new GetAvailableStockQuery(variantId));
  }
}
