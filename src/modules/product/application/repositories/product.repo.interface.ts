import {ProductAggRoot} from "src/modules/product/domain/aggregate-roots/product.agg-root";

export interface IProductRepository {
    insert(domain: ProductAggRoot): Promise<void>;
    update(domain: ProductAggRoot): Promise<void>;
    findById(productId: string): Promise<ProductAggRoot | null>;
    findByVariantId(variantId: string): Promise<ProductAggRoot | null>;
}