import { QueryBus } from '@nestjs/cqrs';
import { IVendorPublicService } from './vendor.public-service.interface';
import { GetVendorByAccountIdQuery } from '../queries/get-vendor-by-account-id/query';
import { VendorDto } from '../../presentation/dtos/responses/vendor.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VendorPublicService implements IVendorPublicService {
  constructor(private readonly queryBus: QueryBus) {}

  async getVendorByAccountId(accountId: string): Promise<VendorDto | null> {
    return await this.queryBus.execute(
      new GetVendorByAccountIdQuery(accountId),
    );
  }
}
