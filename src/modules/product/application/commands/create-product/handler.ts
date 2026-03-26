import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateProductCommand } from './command';
import { ProductAggRoot } from 'src/modules/product/domain/aggregate-roots/product.agg-root';
import { ProductVariant } from 'src/modules/product/domain/entities/product-variant';
import { VariantAssociatedAttributeVO } from '../../../domain/value-objects/variant-associated-attribute.vo';
import { ProductAttribute } from 'src/modules/product/domain/entities/product-attribute';
import { Inject } from '@nestjs/common';
import {
  IProductRepository,
  PRODUCT_REPO,
} from 'src/modules/product/domain/repositories/product.repo.interface';
import { OutboxRepository } from 'src/shared/ddd/infrastructure/outbox/outbox.repo';
import { Status } from 'src/shared/ddd/infrastructure/outbox/outbox.entity';
import { v7 as uuidV7 } from 'uuid';

@CommandHandler(CreateProductCommand)
export class CreateProductCommandHandler
  implements ICommandHandler<CreateProductCommand>
{
  constructor(
    @Inject(PRODUCT_REPO)
    private readonly productRepository: IProductRepository,
    private readonly outboxRepository: OutboxRepository,
  ) {}

  async execute(command: CreateProductCommand): Promise<string> {
    const { payload } = command;

    const product = {
      name: payload.name,
      vendorId: payload.vendorId,
      categoryId: payload.categoryId,
      description: payload.description,
      attributes: payload.attributes.map((a) =>
        ProductAttribute.create({ key: a.key, values: a.values }),
      ),
      variants: payload.variants.map((v) =>
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
      ),
    };

    const productAggRoot = ProductAggRoot.create(product);

    productAggRoot.calculateDisplayPrice();

    await this.productRepository.insert(productAggRoot);
    const events = productAggRoot.getUncommittedEvents();
    for (const event of events) {
      await this.outboxRepository.save({
        id: uuidV7(),
        name: event.constructor.name,
        payload: event,
        status: Status.PENDING,
      });
    }
    return `Product with id ${productAggRoot.getId()} created successfully!`;
  }
}
