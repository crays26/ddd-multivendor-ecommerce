// src/products/commands/handlers/create-product.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from './command';
import { ProductRepository } from 'src/modules/product/infrastructure/repositories/product.repo';
import { ProductAggRoot } from 'src/modules/product/domain/aggregate-roots/Product';
import { ProductVariant } from 'src/modules/product/domain/entities/ProductVariant';
import { VariantAttributeValueVO } from '../../../domain/value-objects/VariantAttributeValue';
import { ProductAttribute } from 'src/modules/product/domain/entities/ProductAttribute';

@CommandHandler(CreateProductCommand)
export class CreateProductCommandHandler
  implements ICommandHandler<CreateProductCommand>
{
  constructor(private readonly productRepository: ProductRepository) {}

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
    
    await this.productRepository.save(productAggRoot);

    return `Product with id ${productAggRoot.getId()} created successfully!`;
  }
}
