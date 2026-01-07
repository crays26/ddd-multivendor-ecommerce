import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreateVendorCommand } from 'src/modules/vendor/application/commands/create-vendor/command';
import { VendorRepository } from 'src/modules/vendor/infrastructure/repositories/vendor.repo';
import { VendorAggRoot } from 'src/modules/vendor/domain/aggregate-roots/vendor.agg-root';
import { slugifyWithNanoid } from 'src/shared/utilities/slugify-with-nanoid';
import { Transactional } from '@mikro-orm/core';
import { AccountPublicService } from 'src/modules/account/application/public-services/account.public-service';
import { RoleName } from 'src/shared/auth/types/role.type';

@CommandHandler(CreateVendorCommand)
export class CreateVendorCommandHandler
  implements ICommandHandler<CreateVendorCommand>
{
  constructor(
    private readonly vendorRepo: VendorRepository,
    private readonly eventPublisher: EventPublisher,
    private readonly accountPublicService: AccountPublicService,
  ) {}

  @Transactional()
  async execute(command: CreateVendorCommand): Promise<string> {
    const { payload } = command;

    const vendorAggRoot = VendorAggRoot.create({
      ...payload,
      slug: slugifyWithNanoid(payload.name),
    });

    await this.vendorRepo.insert(vendorAggRoot);
    await this.accountPublicService.assignRole(
      payload.accountId,
      RoleName.VENDOR,
    );
    this.eventPublisher.mergeObjectContext(vendorAggRoot).commit();

    return vendorAggRoot.getId();
  }
}
