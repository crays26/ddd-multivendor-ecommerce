import { EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ProductEntity } from '../entities/Product.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ProductAggRoot } from '../../domain/aggregate-root/Product';
import { ppid } from 'process';
import { ProductVariantEntity } from '../entities/ProductVariant.entity';
import { ProductAttributeEntity } from '../entities/ProductAttribute.entity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: EntityRepository<ProductEntity>,
    private readonly em: EntityManager,
  ) {}

  async save(domain: ProductAggRoot): Promise<void> {
    let product: ProductEntity | null = await this.repo.findOne(
      { id: domain.getId() },
      { populate: ['variants', 'attributes'] },
    );
    if (!product) {
      product = new ProductEntity();
      product.id = domain.getId();
    }

    product.name = domain.getName();

    const existingVariants = product.variants.getItems();
    
    existingVariants
      .filter((v) => !domain.getVariants().some((dv) => dv.getId() === v.id))
      .forEach((v) => product!.variants.remove(v));

    for (const v of domain.getVariants()) {
      let variant = existingVariants.find((ev) => ev.id === v.getId());
      if (!variant) {
        variant = new ProductVariantEntity();
        variant.id = v.getId();
      }
      variant.name = v.getName();
      variant.price = v.getPrice();
      variant.skuCode = v.getSkuCode();
      variant.stock = v.getStock();
      variant.associatedAttributes = v.getAttributes();

      product.variants.add(variant);

      const existingAttributes = product.attributes.getItems();

      existingAttributes
        .filter(
          (attr) =>
            !domain.getAttributes().some((da) => da.getId() === attr.id),
        )
        .forEach((attr) => product!.attributes.remove(attr));

      // Add or update attributes
      for (const a of domain.getAttributes()) {
        let attribute = existingAttributes.find((ea) => ea.id === a.getId());
        if (!attribute) {
          attribute = new ProductAttributeEntity();
          attribute.id = a.getId();
        }
        attribute.key = a.getKey();
        attribute.values = a.getValues();
        product.attributes.add(attribute);
      }

      await this.em.persistAndFlush(product);
    }
  }

  // const variants = domain.getVariants().map(v => {
  //     const variant = new ProductVariantEntity();
  //     variant.id = v.getId();
  //     variant.name = v.getName();
  //     variant.price = v.getPrice();
  //     variant.skuCode = v.getSkuCode();
  //     variant.stock = v.getStock();
  //     variant.associatedAttributes = v.getAttributes();

  //     return variants;
  // })
  // product.variants.set(variants)
}
