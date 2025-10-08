import { ProductEntity } from '../entities/product.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ProductAggRoot } from '../../domain/aggregate-roots/product.agg-root';
import { ProductVariantEntity } from '../entities/product-variant.entity';
import { ProductAttributeEntity } from '../entities/product-attribute.entity';
import { IProductRepository } from 'src/modules/product/application/repositories/product.repo.interface';
import {ProductDomainMapper} from "src/modules/product/infrastructure/mappers/product.mapper";

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<ProductAggRoot | null> {
    const product: ProductEntity | null = await this.em.findOne(
      ProductEntity,
      { id },
      { populate: ['attributes', 'variants'] },
    );
    if (!product) return null;
    return ProductDomainMapper.fromPersistence(product);
  }

    async findByVariantId(id: string): Promise<ProductAggRoot | null> {
        const product: ProductEntity | null = await this.em.findOne(
            ProductEntity,
            { variants: id },
            { populate: ['attributes', 'variants'] },
        );
        if (!product) return null;
        return ProductDomainMapper.fromPersistence(product);
    }

  async insert(domain: ProductAggRoot): Promise<void> {
    const product = new ProductEntity();
    product.id = domain.getId();
    product.name = domain.getName();
    product.slug = domain.getSlug();

    for (const v of domain.getVariants()) {
      const variant = new ProductVariantEntity();
      variant.id = v.getId();
      variant.isBase = false;
      variant.isSoftDeleted = false;
      variant.name = v.getName();
      variant.price = v.getPrice();
      variant.skuCode = v.getSkuCode();
      variant.stock = v.getStock();
      variant.associatedAttributes = v.getAssociatedAttributes();
      product.variants.add(variant);

      for (const a of domain.getAttributes()) {
        const attribute = new ProductAttributeEntity();
        attribute.id = a.getId();
        attribute.isSoftDeleted = false;
        attribute.key = a.getKey();
        attribute.values = a.getValues();
        product.attributes.add(attribute);
      }

      this.em.persist(product);
    }
  }

  async update(domain: ProductAggRoot): Promise<void> {
    const product: ProductEntity = await this.em.findOneOrFail(ProductEntity,
      { id: domain.getId() },
      { populate: ['variants', 'attributes'] },
    );

    product.name = domain.getName();
    product.slug = domain.getSlug();

    const existingVariants = product.variants.getItems();

    const domainVariantIdList = domain.getVariants().map((v) => v.getId());
    for (const ev of existingVariants) {
      if (!domainVariantIdList.includes(ev.id)) {
        ev.isSoftDeleted = true;
      }
    }

    for (const v of domain.getVariants()) {
      let variant = existingVariants.find((ev) => ev.id === v.getId());
      if (!variant) {
        variant = new ProductVariantEntity();
        variant.id = v.getId();
        variant.isBase = false;
        variant.isSoftDeleted = false;

        product.variants.add(variant);
      }
      variant.name = v.getName();
      variant.price = v.getPrice();
      variant.skuCode = v.getSkuCode();
      variant.stock = v.getStock();
      variant.associatedAttributes = v.getAssociatedAttributes();
    }

    const existingAttributes = product.attributes.getItems();

    const domainAttributeIdList = domain.getAttributes().map((a) => a.getId());
    for (const v of existingAttributes) {
      if (!domainAttributeIdList.includes(v.id)) {
        v.isSoftDeleted = true;
      }
    }

    for (const a of domain.getAttributes()) {
      let attribute = existingAttributes.find((ea) => ea.id === a.getId());
      if (!attribute) {
        attribute = new ProductAttributeEntity();
        attribute.id = a.getId();
        attribute.isSoftDeleted = false;
        product.attributes.add(attribute);
      }
      attribute.key = a.getKey();
      attribute.values = a.getValues();
    }

    this.em.persist(product);
  }

  // async save(domain: ProductAggRoot): Promise<void> {
  //   let product: ProductEntity | null = await this.repo.findOne(
  //     { id: domain.getId() },
  //     { populate: ['variants', 'attributes'] },
  //   );
  //   if (!product) {
  //     product = new ProductEntity();
  //     product.id = domain.getId();
  //   }
  //   product.name = domain.getName();
  //   product.slug = domain.getSlug();
  //
  //   const existingVariants = product.variants.getItems();
  //
  //   existingVariants
  //     .filter((v) => !domain.getVariants().some((dv) => dv.getId() === v.id))
  //     .forEach((v) => (v.isSoftDeleted = true));
  //
  //   for (const v of domain.getVariants()) {
  //     let variant = existingVariants.find((ev) => ev.id === v.getId());
  //     if (!variant) {
  //       variant = new ProductVariantEntity();
  //       variant.id = v.getId();
  //       variant.isBase = false;
  //       variant.isSoftDeleted = false;
  //
  //       product.variants.add(variant);
  //     }
  //     variant.name = v.getName();
  //     variant.price = v.getPrice();
  //     variant.skuCode = v.getSkuCode();
  //     variant.stock = v.getStock();
  //     variant.associatedAttributes = v.getAssociatedAttributes();
  //   }
  //
  //   const existingAttributes = product.attributes.getItems();
  //
  //   existingAttributes
  //     .filter(
  //       (attr) => !domain.getAttributes().some((da) => da.getId() === attr.id),
  //     )
  //     .forEach((attr) => (attr.isSoftDeleted = true));
  //
  //   for (const a of domain.getAttributes()) {
  //     let attribute = existingAttributes.find((ea) => ea.id === a.getId());
  //     if (!attribute) {
  //       attribute = new ProductAttributeEntity();
  //       attribute.id = a.getId();
  //       attribute.isSoftDeleted = false;
  //       product.attributes.add(attribute);
  //     }
  //     attribute.key = a.getKey();
  //     attribute.values = a.getValues();
  //   }
  //
  //   await this.em.persistAndFlush(product);
  // }
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
// product.variants.set(variants);
