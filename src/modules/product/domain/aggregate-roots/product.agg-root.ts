import { AggregateRootBase } from 'src/shared/ddd/domain/base/aggregate-root.base';
import { ProductVariant } from '../entities/product-variant';
import { ProductAttribute } from '../entities/product-attribute';
import { slugifyWithNanoid } from 'src/shared/utilities/slugify-with-nanoid';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { v7 as uuidV7 } from 'uuid';
import { VendorIdVO } from 'src/modules/product/domain/value-objects/vendor-id.vo';
import { CategoryIdVO } from 'src/modules/product/domain/value-objects/category-id.vo';

interface ProductProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  vendorId: VendorIdVO;
  categoryId: CategoryIdVO;
  variants: ProductVariant[];
  attributes: ProductAttribute[];
}

interface CreateProductProps {
  id?: string;
  name: string;
  description: string;
  categoryId: string;
  vendorId: string;
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
}

export class ProductAggRoot extends AggregateRootBase<string, ProductProps> {
  private constructor(props: ProductProps) {
    super(props);
    this.validate(props);
  }

  static create(props: CreateProductProps): ProductAggRoot {
    const product = new ProductAggRoot({
      ...props,
      id: props.id ?? uuidV7(),
      slug: slugifyWithNanoid(props.name, 8),
      vendorId: VendorIdVO.create({ id: props.vendorId }),
      categoryId: CategoryIdVO.create({ id: props.categoryId }),
      variants: props.variants ?? [],
      attributes: props.attributes ?? [],
    });
    // product.addEvent(new ProductCreatedEvent(props.id));
    return product;
  }

  static rehydrate(props: ProductProps): ProductAggRoot {
    return new ProductAggRoot(props);
  }

  private validate(props: ProductProps): void {
    for (const variant of props.variants) {
      if (
        variant.getAssociatedAttributes().length !== props.attributes.length
      ) {
        throw new BadRequestException(
          `Variant ${variant.getId?.() ?? ''} does not have the same number of attributes as defined.`,
        );
      }

      for (const associatedAttr of variant.getAssociatedAttributes()) {
        const attr = props.attributes.find(
          (a) => a.getKey() === associatedAttr.key,
        );
        if (!attr) {
          throw new BadRequestException(
            `Variant ${variant.getId?.() ?? ''} contains invalid attribute key "${associatedAttr.key}".`,
          );
        }

        if (!attr.getValues().includes(associatedAttr.value)) {
          throw new BadRequestException(
            `Variant ${variant.getId?.() ?? ''} has invalid value "${associatedAttr.value}" for attribute "${associatedAttr.key}".`,
          );
        }
      }
    }

    const seenCombinations = new Set<string>();

    for (const variant of props.variants) {
      const comboKey = variant
        .getAssociatedAttributes()
        .map((a) => `${a.key}:${a.value}`)
        .sort()
        .join('|');

      if (seenCombinations.has(comboKey)) {
        throw new BadRequestException(
          `Duplicate variant combination found: ${comboKey}. Each variant must have a unique combination of attributes.`,
        );
      }

      seenCombinations.add(comboKey);
    }
  }

  public setName(name: string) {
    this.props.name = name;
  }

  public setSlug(slug: string) {
    this.props.slug = slug;
  }

  public setDescription(description: string) {
    if (!description || description.length < 10) {
      throw new BadRequestException('Description too short');
    }
    this.props.description = description;
  }

  public addVariant(variant: ProductVariant): void {
    if (this.props.variants.some((v) => v.getId() === variant.getId())) {
      throw new ConflictException(
        `Variant with SKU ${variant.getId()} already exists`,
      );
    }
    this.props.variants.push(variant);
    this.validate(this.props);
  }

  public setVariants(variants: ProductVariant[]): void {
    const skuSet = new Set(variants.map((v) => v.getId()));
    if (skuSet.size !== variants.length) {
      throw new ConflictException('Duplicate variant ID found in variants');
    }
    this.props.variants = variants;

    this.validate(this.props);
  }

  public addAttribute(attribute: ProductAttribute): void {
    if (this.props.attributes.some((a) => a.getKey() === attribute.getKey())) {
      throw new ConflictException(
        `Attribute with key ${attribute.getKey()} already exists`,
      );
    }
    this.props.attributes.push(attribute);
    this.validate(this.props);
  }

  public setAttributes(attributes: ProductAttribute[]): void {
    const keySet = new Set(attributes.map((a) => a.getKey()));
    if (keySet.size !== attributes.length) {
      throw new ConflictException('Duplicate attribute keys found');
    }
    this.props.attributes = attributes;
    this.validate(this.props);
  }

  public getId(): string {
    return this.props.id;
  }

  public getSlug(): string {
    return this.props.slug;
  }

  public getName(): string {
    return this.props.name;
  }

  public getCategoryId(): string {
    return this.props.categoryId.getId();
  }

  public getVendorId(): string {
    return this.props.vendorId.getId();
  }

  public getDescription(): string {
    return this.props.description;
  }

  public getVariants(): ProductVariant[] {
    return this.props.variants;
  }

  public getAttributes(): ProductAttribute[] {
    return this.props.attributes;
  }
}
