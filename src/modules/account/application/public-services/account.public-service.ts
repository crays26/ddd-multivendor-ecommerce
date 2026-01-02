import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  ACCOUNT_REPO,
  IAccountRepository,
} from 'src/modules/account/domain/repositories/account.repo.interface';
import {
  IRoleRepository,
  ROLE_REPO,
} from 'src/modules/account/domain/repositories/role.repo.interface';
import { RoleName } from 'src/shared/auth/types/role.type';
import { RoleIdVO } from 'src/modules/account/domain/value-objects/role-id.vo';

@Injectable()
export class AccountPublicService {
  constructor(
    @Inject(ACCOUNT_REPO)
    private readonly accountRepo: IAccountRepository,
    @Inject(ROLE_REPO)
    private readonly roleRepo: IRoleRepository,
  ) {}

  async addVendorRole(accountId: string): Promise<void> {
    const role = await this.roleRepo.findByName(RoleName.VENDOR);
    if (!role) throw new NotFoundException('Vendor role not found');

    const account = await this.accountRepo.findById(accountId);
    if (!account) throw new NotFoundException('Account not found');

    account.addRole(RoleIdVO.create({ id: role.getId() }));
    await this.accountRepo.update(account);
  }
}
