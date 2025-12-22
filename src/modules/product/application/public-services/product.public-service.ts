import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ChangeVariantStockCommand } from 'src/modules/product/application/commands/change-variant-stock/command';
import {IProductPublicService} from "src/modules/product/application/public-services/product.public-service.interface";

@Injectable()
export class ProductPublicService implements IProductPublicService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  async changeVariantStock(productVariantId: string, deltaStock: number) {
    await this.commandBus.execute(
      new ChangeVariantStockCommand({ productVariantId, deltaStock }),
    );
  }
}
