import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateVendorCommand } from 'src/modules/vendor/application/commands/create-vendor/command';
import { VendorRepository } from 'src/modules/vendor/infrastructure/repositories/vendor.repo';
import { VendorAggRoot } from 'src/modules/vendor/domain/aggregate-roots/vendor.agg-root';
import {
  IUnitOfWork,
  UNIT_OF_WORK,
} from 'src/shared/ddd/infrastructure/unit-of-work/unit-of-work.interface';
import { Inject } from '@nestjs/common';
import { slugifyWithNanoid } from 'src/shared/utilities/slugify-with-nanoid';

@CommandHandler(CreateVendorCommand)
export class CreateVendorCommandHandler
  implements ICommandHandler<CreateVendorCommand>
{
  constructor(
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    // private readonly vendorRepository: VendorRepository
  ) {}

  async execute(command: CreateVendorCommand): Promise<string> {
    const { payload } = command;

    const vendorAggRoot = VendorAggRoot.create({
      ...payload,
      slug: slugifyWithNanoid(payload.name),
    });
    await this.uow.begin();
    try {
      const repo = this.uow.getRepository(VendorRepository);
      await repo.insert(vendorAggRoot);
      await this.uow.commit();
    } catch (error) {
      await this.uow.rollback();
      throw error;
    }

    return `Vendor with id ${vendorAggRoot.getId()} created successfully!`;
  }
}
