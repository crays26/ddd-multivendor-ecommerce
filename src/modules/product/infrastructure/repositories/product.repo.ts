import { EntityRepository } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ProductEntity } from '../entities/product.entity';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ProductAggRoot } from '../../domain/aggregate-roots/product.agg-root';
import { ProductVariantEntity } from '../entities/product-variant.entity';
import { ProductAttributeEntity } from '../entities/product-attribute.entity';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: EntityRepository<ProductEntity>,
    private readonly em: EntityManager,
  ) {}

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
    const product: ProductEntity = await this.repo.findOneOrFail(
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
    product.slug = domain.getSlug();

    const existingVariants = product.variants.getItems();

    existingVariants
      .filter((v) => !domain.getVariants().some((dv) => dv.getId() === v.id))
      .forEach((v) => (v.isSoftDeleted = true));

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

    existingAttributes
      .filter(
        (attr) => !domain.getAttributes().some((da) => da.getId() === attr.id),
      )
      .forEach((attr) => (attr.isSoftDeleted = true));

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

    await this.em.persistAndFlush(product);
  }

  async save2(domain: ProductAggRoot): Promise<void> {
    const product = this.em.merge(ProductEntity, {
      id: domain.getId(),
      name: domain.getName(),
      slug: domain.getName(),
      variants: domain.getVariants().map((v) => ({
        id: v.getId(),
        name: v.getName(),
        price: v.getPrice(),
        skuCode: v.getSkuCode(),
        stock: v.getStock(),
        associatedAttributes: v.getAssociatedAttributes(),
      })),
      attributes: domain.getAttributes().map((a) => ({
        id: a.getId(),
        key: a.getKey(),
        values: a.getValues(),
      })),
    });

    await this.em.flush();
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
// product.variants.set(variants);
