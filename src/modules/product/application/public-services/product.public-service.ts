import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ChangeVariantStockCommand } from 'src/modules/product/application/commands/change-variant-stock/command';
import { IProductPublicService } from 'src/modules/product/application/public-services/product.public-service.interface';
import { GetVariantByIdDto } from '../queries/get-variant-by-id/dto';
import { GetVariantByIdQuery } from '../queries/get-variant-by-id/query';

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

  async getVariantById(variantId: string): Promise<GetVariantByIdDto> {
    return await this.queryBus.execute(new GetVariantByIdQuery(variantId));
  }
}
