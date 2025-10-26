import { EntityManager, EntityRepository, wrap } from '@mikro-orm/postgresql';
import { AccountAggRoot } from 'src/modules/account/domain/aggregate-root/account.agg-root';
import { AccountDto } from 'src/modules/account/presentation/dtos/response/account.response.dto';
import { Account } from 'src/modules/account/infrastructure/entities/account.entity';
import { plainToInstance } from 'class-transformer';

export class AccountReadRepository {
  constructor(private readonly em: EntityManager) {}

  async findById(id: string): Promise<AccountDto | null> {
    const account: Account | null = await this.em.findOne(Account, id, {
      populate: ['roles'],
    });
    if (!account) return null;
    return plainToInstance(AccountDto, wrap(account).toObject());
  }
}
