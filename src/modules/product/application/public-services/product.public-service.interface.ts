export interface IProductPublicService {
  changeVariantStock(productVariantId: string, deltaStock: number): void;
}

export const PRODUCT_PUBLIC_SERVICE = Symbol("PRODUCT_PUBLIC_SERVICE");
