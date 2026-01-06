import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from './command';
import { ProductRepository } from 'src/modules/product/infrastructure/repositories/product.repo';
import { ProductAggRoot } from 'src/modules/product/domain/aggregate-roots/product.agg-root';
import { ProductVariant } from 'src/modules/product/domain/entities/product-variant';
import { VariantAssociatedAttributeVO } from '../../../domain/value-objects/variant-associated-attribute.vo';
import { ProductAttribute } from 'src/modules/product/domain/entities/product-attribute';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/shared/ddd/infrastructure/unit-of-work/unit-of-work.interface';
import { Inject } from '@nestjs/common';
@CommandHandler(CreateProductCommand)
export class CreateProductCommandHandler
  implements ICommandHandler<CreateProductCommand>
{
  constructor(
    private readonly productRepository: ProductRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: CreateProductCommand): Promise<string> {
    const { payload } = command;

    const product = {
      name: payload.name,
      vendorId: payload.vendorId,
      categoryId: payload.categoryId,
      description: payload.description,
    };

    const productAggRoot = ProductAggRoot.create(product);

    const variants = payload.variants.map((v) =>
      ProductVariant.create({
        name: v.name,
        skuCode: v.skuCode,
        stock: v.stock,
        price: v.price,
        isBase: v.isBase,
        associatedAttributes: v.associatedAttributes.map((a) =>
          VariantAssociatedAttributeVO.create(a),
        ),
      }),
    );

    const attributes = payload.attributes.map((a) =>
      ProductAttribute.create({ key: a.key, values: a.values }),
    );

    productAggRoot.setVariants(variants);
    productAggRoot.setAttributes(attributes);
    productAggRoot.calculateDisplayPrice();

    await this.uow.begin();
    try {
      await this.productRepository.insert(productAggRoot);
      await this.uow.commit();
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }
    return `Product with id ${productAggRoot.getId()} created successfully!`;
  }
}
