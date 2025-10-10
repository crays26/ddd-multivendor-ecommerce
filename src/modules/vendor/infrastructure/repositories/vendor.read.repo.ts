import { EntityManager, wrap } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { VendorEntity } from '../entities/vendor.entity';
import { VendorDto } from 'src/modules/vendor/presentation/dtos/responses/vendor.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class VendorReadRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<VendorDto | null> {
    const vendor: VendorEntity | null = await this.em.findOne(VendorEntity, id);
    if (!vendor) return null;
    return plainToInstance(VendorDto, wrap(vendor).toObject(), {
      excludeExtraneousValues: true,
    });
  }

  async findByAccountId(accountId: string): Promise<VendorDto | null> {
    const vendor: VendorEntity | null = await this.em.findOne(VendorEntity, {
      account: accountId,
    });
    if (!vendor) return null;
    return plainToInstance(VendorDto, wrap(vendor).toObject(), {
      excludeExtraneousValues: true,
    });
  }
}
