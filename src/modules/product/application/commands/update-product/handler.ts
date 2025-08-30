// src/products/commands/handlers/create-product.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateProductCommand } from './command';
import { ProductRepository } from 'src/modules/product/infrastructure/repositories/product.repo';
import { ProductAggRoot } from 'src/modules/product/domain/aggregate-roots/Product';
import { ProductVariant } from 'src/modules/product/domain/entities/ProductVariant';
import { VariantAttributeValueVO } from '../../../domain/value-objects/VariantAttributeValue';
import { ProductAttribute } from 'src/modules/product/domain/entities/ProductAttribute';

@CommandHandler(UpdateProductCommand)
export class UpdateProductCommandHandler
  implements ICommandHandler<UpdateProductCommand>
{
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(command: UpdateProductCommand): Promise<string> {
    const { payload } = command;

    const product = {
      id: payload.id,  
      name: payload.name,
      vendorId: payload.vendorId,
      categoryId: payload.categoryId,
      description: payload.description,
      variants: payload.variants.map((v) =>
        ProductVariant.create({
          id: v.id,  
          name: v.name,
          skuCode: v.skuCode,
          stock: v.stock,
          price: v.price,
          associatedAttributes: v.associatedAttributes.map((a) =>
            VariantAttributeValueVO.create(a.key, a.value),
          ),
        }),
      ),
      attributes: payload.attributes.map((a) =>
        ProductAttribute.create({ id: a.id, key: a.key, values: a.values }),
      ),
    };

    const productAggRoot = ProductAggRoot.create(product);
    
    await this.productRepository.save(productAggRoot);

    return `Product with id ${productAggRoot.getId()} update successfully!`;
  }
}
