import {ProductEntity} from "src/modules/product/infrastructure/entities/product.entity";
import {ProductAggRoot} from "src/modules/product/domain/aggregate-roots/product.agg-root";
import {VendorIdVO} from "src/modules/product/domain/value-objects/vendor-id.vo";
import {CategoryIdVO} from "src/modules/product/domain/value-objects/category-id.vo";
import {ProductAttribute} from "src/modules/product/domain/entities/product-attribute";
import {ProductVariant} from "src/modules/product/domain/entities/product-variant";
import {VariantAssociatedAttributeVO} from "src/modules/product/domain/value-objects/variant-associated-attribute.vo";

export class ProductDomainMapper {

    static fromPersistence(productEntity: ProductEntity) {
        return ProductAggRoot.rehydrate({
            ...productEntity,
            description: productEntity.description ?? '',
            vendorId: VendorIdVO.create({ id: productEntity.vendor.id }),
            categoryId: CategoryIdVO.create({ id: productEntity.category.id }),
            attributes: productEntity.attributes.map(a => ProductAttribute.create(a)),
            variants: productEntity.variants.map(v => ProductVariant.create({
                ...v,
                associatedAttributes: v.associatedAttributes.map(a => VariantAssociatedAttributeVO.create(a))
            })),
        })
    }
}