import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetVendorByAccountIdQuery } from './query';
import { VendorReadRepository } from 'src/modules/vendor/infrastructure/repositories/vendor.read.repo';
import { VendorDto } from 'src/modules/vendor/presentation/dtos/responses/vendor.dto';
import { InjectRepository } from '@mikro-orm/nestjs';
import { VendorEntity } from 'src/modules/vendor/infrastructure/entities/vendor.entity';
import { VendorRepository } from 'src/modules/vendor/infrastructure/repositories/vendor.repo';
import { EntityRepository } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/postgresql';
import { plainToInstance } from 'class-transformer';
@QueryHandler(GetVendorByAccountIdQuery)
export class GetVendorByAccountIdQueryHandler
  implements IQueryHandler<GetVendorByAccountIdQuery>
{
  constructor(
    @InjectRepository(VendorEntity)
    private readonly vendorRepository: EntityRepository<VendorEntity>,
  ) {}

  async execute(query: GetVendorByAccountIdQuery): Promise<VendorDto | null> {
    const vendor: VendorEntity | null = await this.vendorRepository.findOne({
      account: query.accountId,
    });
    if (!vendor) return null;
    return plainToInstance(VendorDto, wrap(vendor).toObject());
  }
}
