import { VendorDto } from '../../presentation/dtos/responses/vendor.dto';

export interface IVendorPublicService {
  getVendorByAccountId(accountId: string): Promise<VendorDto | null>;
}

export const VENDOR_PUBLIC_SERVICE = Symbol('VENDOR_PUBLIC_SERVICE');
