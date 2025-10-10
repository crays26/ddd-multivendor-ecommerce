import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  GetVendorByAccountIdQuery,
} from './query';
import {VendorReadRepository} from "src/modules/vendor/infrastructure/repositories/vendor.read.repo";
import {VendorDto} from "src/modules/vendor/presentation/dtos/responses/vendor.dto";
@QueryHandler(GetVendorByAccountIdQuery)
export class GetVendorByAccountIdQueryHandler
    implements IQueryHandler<GetVendorByAccountIdQuery>
{
    constructor(
        private readonly vendorReadRepo: VendorReadRepository) {}

    async execute(query: GetVendorByAccountIdQuery): Promise<VendorDto | null> {
        const vendorDto: VendorDto | null = await this.vendorReadRepo.findByAccountId(query.accountId);
        if (!vendorDto) return null;
        return vendorDto;
    }
}
