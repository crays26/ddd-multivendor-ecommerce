// src/products/commands/handlers/create-product.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProductCommand } from './command';
import { ProductRepository } from 'src/modules/product/infrastructure/repositories/product.repo';
import { ProductAggRoot } from 'src/modules/product/domain/aggregate-roots/product.agg-root';
import { ProductVariant } from 'src/modules/product/domain/entities/product-variant';
import { VariantAttributeValueVO } from '../../../domain/value-objects/variant-attribute-value';
import { ProductAttribute } from 'src/modules/product/domain/entities/product-attribute';

@CommandHandler(UpdateProductCommand)
export class UpdateProductCommandHandler
  implements ICommandHandler<UpdateProductCommand>
{
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: UpdateProductCommand): Promise<string> {
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
        associatedAttributes: v.associatedAttributes.map((a) =>
          VariantAttributeValueVO.create(a.key, a.value),
        ),
      }),
    );

    const attributes = payload.attributes.map((a) =>
      ProductAttribute.create({ key: a.key, values: a.values }),
    );

    productAggRoot.setVariants(variants);
    productAggRoot.setAttributes(attributes);

    await this.productRepository.update(productAggRoot);

    return `Product with id ${productAggRoot.getId()} update successfully!`;
  }
}
