import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAccountByIdQuery } from './query';
import { AccountDto } from 'src/modules/account/presentation/dtos/response/account.response.dto';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Account } from 'src/modules/account/infrastructure/entities/account.entity';
import { EntityRepository } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/postgresql';
@QueryHandler(GetAccountByIdQuery)
export class GetAccountOfCurrentUserQueryHandler
  implements IQueryHandler<GetAccountByIdQuery>
{
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: EntityRepository<Account>,
  ) {}
  async execute(query: GetAccountByIdQuery): Promise<AccountDto | null> {
    const account: Account | null = await this.accountRepo.findOne(
      { id: query.id },
      { populate: ['roles'] },
    );
    if (!account) return null;
    return plainToInstance(AccountDto, wrap(account).toObject());
  }
}
