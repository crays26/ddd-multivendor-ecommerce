import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeVariantStockCommand } from './command';
import { ProductRepository } from 'src/modules/product/infrastructure/repositories/product.repo';
import { Inject } from '@nestjs/common';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/shared/ddd/infrastructure/unit-of-work/unit-of-work.interface';

@CommandHandler(ChangeVariantStockCommand)
export class ChangeVariantStockCommandHandler
  implements ICommandHandler<ChangeVariantStockCommand>
{
  constructor(
    private readonly productRepository: ProductRepository,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: ChangeVariantStockCommand): Promise<string> {
    const { payload } = command;
    const { productVariantId, deltaStock } = payload;
    await this.uow.begin();
    try {
      await this.productRepository.changeStock(productVariantId, deltaStock);
      await this.uow.commit();
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }

    return `Product variant with id ${productVariantId} update stock successfully.!`;
  }
}
