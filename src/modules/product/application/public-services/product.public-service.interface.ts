import { GetVariantByIdDto } from '../queries/get-variant-by-id/dto';

export interface IProductPublicService {
  changeVariantStock(productVariantId: string, deltaStock: number): void;
  getVariantById(variantId: string): Promise<GetVariantByIdDto>;
}

export const PRODUCT_PUBLIC_SERVICE = Symbol('PRODUCT_PUBLIC_SERVICE');
