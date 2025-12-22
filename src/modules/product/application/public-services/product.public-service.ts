import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ChangeVariantStockCommand } from 'src/modules/product/application/commands/change-variant-stock/command';

export class ProductFacadeService {
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
