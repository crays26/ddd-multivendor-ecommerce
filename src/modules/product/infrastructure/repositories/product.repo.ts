import { ProductEntity } from '../entities/product.entity';
import { EntityManager, sql } from '@mikro-orm/postgresql';
import { ConflictException, Injectable } from '@nestjs/common';
import { ProductAggRoot } from '../../domain/aggregate-roots/product.agg-root';
import { ProductVariantEntity } from '../entities/product-variant.entity';
import { ProductAttributeEntity } from '../entities/product-attribute.entity';
import { IProductRepository } from 'src/modules/product/domain/repositories/product.repo.interface';
import { ProductDomainMapper } from 'src/modules/product/infrastructure/mappers/product.mapper';
import { VendorEntity } from 'src/modules/vendor/infrastructure/entities/vendor.entity';
import { CategoryEntity } from 'src/modules/product/infrastructure/entities/category.entity';
import { ProductVariant } from 'src/modules/product/domain/entities/product-variant';
import { ProductAttribute } from 'src/modules/product/domain/entities/product-attribute';

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

  async insert(aggregate: ProductAggRoot): Promise<void> {
    const entity = new ProductEntity();
    entity.id = aggregate.getId();
    this.mapAggregateToEntity(aggregate, entity);
    this.upsertVariants(aggregate, entity);
    this.upsertAttributes(aggregate, entity);

    await this.em.persistAndFlush(entity);
  }

  async update(aggregate: ProductAggRoot): Promise<void> {
    const entity = await this.em.findOneOrFail(
      ProductEntity,
      { id: aggregate.getId() },
      { populate: ['variants', 'attributes'] },
    );

    this.mapAggregateToEntity(aggregate, entity);
    this.softDeleteUnusedVariants(aggregate, entity);
    this.upsertVariants(aggregate, entity);

    this.softDeleteUnusedAttributes(aggregate, entity);
    this.upsertAttributes(aggregate, entity);

    await this.em.persistAndFlush(entity);
  }

  async changeStock(
    productVariantId: string,
    stockDelta: number,
  ): Promise<void> {
    const queryBuilder = this.em.createQueryBuilder(ProductVariantEntity, 'p');
    const result = await queryBuilder
      .update({
        stock: sql`stock + ${stockDelta}`,
      })
      .where({
        id: productVariantId,
      })
      .andWhere(sql`stock + ${stockDelta} >= 0`)
      .execute();

    if (result.affectedRows <= 0) {
      throw new ConflictException(
        'Stock update failed: Insufficient stock or Variant not found',
      );
    }
  }
  private mapAggregateToEntity(
    aggregate: ProductAggRoot,
    entity: ProductEntity,
  ): void {
    entity.name = aggregate.getName();
    entity.slug = aggregate.getSlug();
    entity.description = aggregate.getDescription();
    entity.displayPrice = aggregate.getDisplayPrice();
    entity.vendor = this.em.getReference(VendorEntity, aggregate.getVendorId());
    entity.category = this.em.getReference(
      CategoryEntity,
      aggregate.getCategoryId(),
    );
  }

  private mapVariantToEntity(
    domainVariant: ProductVariant,
    entityVariant: ProductVariantEntity,
  ): void {
    entityVariant.name = domainVariant.getName();
    entityVariant.price = domainVariant.getPrice();
    entityVariant.skuCode = domainVariant.getSkuCode();
    entityVariant.stock = domainVariant.getStock();
    entityVariant.associatedAttributes =
      domainVariant.getAssociatedAttributes();
    entityVariant.isSoftDeleted = false;
    entityVariant.isBase = domainVariant.isBase();
  }

  private softDeleteUnusedVariants(
    aggregate: ProductAggRoot,
    entity: ProductEntity,
  ): void {
    const domainIds = aggregate.getVariants().map((v) => v.getId());
    const existingVariants = entity.variants.getItems();

    for (const variant of existingVariants) {
      if (!domainIds.includes(variant.id)) {
        variant.isSoftDeleted = true;
      }
    }
  }

  private upsertVariants(
    aggregate: ProductAggRoot,
    entity: ProductEntity,
  ): void {
    const existingVariants = entity.variants.getItems();

    for (const v of aggregate.getVariants()) {
      let variant = existingVariants.find((ev) => ev.id === v.getId());

      if (!variant) {
        variant = new ProductVariantEntity();
        variant.id = v.getId();
        entity.variants.add(variant);
      }

      this.mapVariantToEntity(v, variant);
    }
  }

  private mapAttributeToEntity(
    domainAttr: ProductAttribute,
    entityAttr: ProductAttributeEntity,
  ): void {
    entityAttr.key = domainAttr.getKey();
    entityAttr.values = domainAttr.getValues();
    entityAttr.isSoftDeleted = false;
  }

  private softDeleteUnusedAttributes(
    aggregate: ProductAggRoot,
    entity: ProductEntity,
  ): void {
    const domainIds = aggregate.getAttributes().map((a) => a.getId());
    const existingAttributes = entity.attributes.getItems();

    for (const attr of existingAttributes) {
      if (!domainIds.includes(attr.id)) {
        attr.isSoftDeleted = true;
      }
    }
  }

  private upsertAttributes(
    aggregate: ProductAggRoot,
    entity: ProductEntity,
  ): void {
    const existingAttributes = entity.attributes.getItems();

    for (const a of aggregate.getAttributes()) {
      let attribute = existingAttributes.find((ea) => ea.id === a.getId());

      if (!attribute) {
        attribute = new ProductAttributeEntity();
        attribute.id = a.getId();
        entity.attributes.add(attribute);
      }

      this.mapAttributeToEntity(a, attribute);
    }
  }
  /**
   * Updates the Product Aggregate using Positional Indexing.
   * This logic runs inside a single database transaction.
   */
  //     async updateProductAggregate(productId: number, dto: ProductUpdateDto): Promise<Loaded<Product>> {
  //         return this.em.transactional(async (trx) => {
  //
  //             // 1. Fetch the entire Product Aggregate Root
  //             // We MUST populate all collections to let the ORM track changes (diffing/orphan removal).
  //             const product = await trx.findOneOrFail(Product, productId, {
  //                 populate: ['options.values', 'variants.optionValues', 'vendor'],
  //             });
  //
  //             // 2. Update root properties
  //             product.name = dto.name;
  //             product.description = dto.description;
  //
  //             // --- 3. PASS 1: SYNC OPTIONS & VALUES ---
  //
  //             // This is our in-memory lookup map. It will be a 2D array of entity objects
  //             // that mirrors the DTO's `options[i].values[j]` structure.
  //             const valueEntityLookup: ProductOptionValue[][] = [];
  //
  //             const newOptions: ProductOption[] = [];
  //
  //             // Iterate DTO options to build the lookup map and update/create entities
  //             // The index `i` is the 'optionIndex'
  //             for (const [i, optionDto] of dto.options.entries()) {
  //
  //                 let option: ProductOption;
  //
  //                 // A. Find or Create Option
  //                 if (optionDto.id) {
  //                     option = product.options.getItems().find(o => o.id === optionDto.id)!;
  //                     option.name = optionDto.name;
  //                 } else {
  //                     option = new ProductOption();
  //                     option.product = product;
  //                     option.name = optionDto.name;
  //                     trx.persist(option); // Persist new option
  //                 }
  //                 newOptions.push(option);
  //
  //                 // B. Find or Create Values and populate the lookup map
  //                 const newValues: ProductOptionValue[] = [];
  //                 valueEntityLookup[i] = []; // Create the nested array for this option index
  //
  //                 // The index `j` is the 'valueIndex'
  //                 for (const [j, valueDto] of optionDto.values.entries()) {
  //                     let value: ProductOptionValue;
  //
  //                     if (valueDto.id) {
  //                         value = option.values.getItems().find(v => v.id === valueDto.id)!;
  //                         value.value = valueDto.value;
  //                     } else {
  //                         value = new ProductOptionValue();
  //                         value.option = option;
  //                         value.value = valueDto.value;
  //                         trx.persist(value); // Persist new value
  //                     }
  //                     newValues.push(value);
  //
  //                     // CRITICAL: Store the entity reference (new or existing)
  //                     // at the same [i][j] position as the DTO.
  //                     valueEntityLookup[i][j] = value;
  //                 }
  //
  //                 // C. Update the collection. `orphanRemoval: true` will delete
  //                 // any values not present in `newValues`.
  //                 option.values.set(newValues);
  //             }
  //
  //             // D. Update the product's main option collection
  //             // `orphanRemoval: true` will delete any old options not in `newOptions`.
  //             product.options.set(newOptions);
  //
  //             // --- 4. PASS 2: SYNC VARIANTS ---
  //
  //             // Now, loop through the DTO variants and use the `valueEntityLookup`
  //             // to link them.
  //             const newVariants: ProductVariant[] = [];
  //
  //             for (const variantDto of dto.variants) {
  //                 let variant: ProductVariant;
  //
  //                 // A. Find or Create Variant
  //                 if (variantDto.id) {
  //                     variant = product.variants.getItems().find(v => v.id === variantDto.id)!;
  //                     variant.sku = variantDto.sku;
  //                     variant.price = variantDto.price;
  //                     variant.stockQuantity = variantDto.stockQuantity;
  //                 } else {
  //                     variant = new ProductVariant();
  //                     variant.product = product;
  //                     variant.sku = variantDto.sku;
  //                     variant.price = variantDto.price;
  //                     variant.stockQuantity = variantDto.stockQuantity;
  //                     trx.persist(variant); // Persist new variant
  //                 }
  //
  //                 // B. Link to Option Values using the Positional Index
  //                 const valuesToLink: ProductOptionValue[] = [];
  //
  //                 for (const [optionIndex, valueIndex] of variantDto.optionValueIndices.entries()) {
  //
  //                     // This is the positional lookup!
  //                     const valueEntity = valueEntityLookup[optionIndex]?.[valueIndex];
  //
  //                     if (!valueEntity) {
  //                         throw new Error(`Positional mapping failed: No value found at options[${optionIndex}].values[${valueIndex}] for SKU ${variantDto.sku}`);
  //                     }
  //                     valuesToLink.push(valueEntity);
  //                 }
  //
  //                 // C. Update the variant's Many-to-Many collection
  //                 variant.optionValues.set(valuesToLink);
  //                 newVariants.push(variant);
  //             }
  //
  //             // D. Update the product's main variant collection
  //             // `orphanRemoval: true` will delete any old variants not in `newVariants`
  //             product.variants.set(newVariants);
  //
  //             // --- 5. FINAL FLUSH ---
  //             // `flush()` is called automatically at the end of `transactional()`
  //             // This will execute all INSERTs, UPDATEs, and DELETEs in the correct order.
  //
  //             return product;
  //         });
  //     }
  // }
}
