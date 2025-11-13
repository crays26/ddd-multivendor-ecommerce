import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAccountByIdQuery } from './query';
import { AccountDto } from 'src/modules/account/presentation/dtos/response/account.response.dto';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@mikro-orm/nestjs';
import { AccountEntity } from 'src/modules/account/infrastructure/entities/account.entity';
import { EntityRepository } from '@mikro-orm/postgresql';
import { wrap } from '@mikro-orm/postgresql';
@QueryHandler(GetAccountByIdQuery)
export class GetAccountByIdQueryHandler
  implements IQueryHandler<GetAccountByIdQuery>
{
  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepo: EntityRepository<AccountEntity>,
  ) {}
  async execute(query: GetAccountByIdQuery): Promise<AccountDto | null> {
    const account: AccountEntity | null = await this.accountRepo.findOne(
      { id: query.id },
      { populate: ['roles'] },
    );
    if (!account) return null;
    return plainToInstance(AccountDto, wrap(account).toObject());
  }
}
