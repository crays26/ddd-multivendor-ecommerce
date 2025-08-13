import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAccountOfCurrentUserQuery } from './query';
import { AccountRepository } from 'src/modules/account/infrastructure/repositories/account.repo';
import { AccountDto } from 'src/modules/account/presentation/dtos/response/account.response.dto';
import { plainToInstance } from 'class-transformer';
import { AccountDtoMapper } from '../../mappers/account.mapper';

@QueryHandler(GetAccountOfCurrentUserQuery)
export class GetAccountOfCurrentUserQueryHandler
  implements IQueryHandler<GetAccountOfCurrentUserQuery>
{
  constructor(private readonly accountRepo: AccountRepository) {}

  async execute(query: GetAccountOfCurrentUserQuery): Promise<AccountDto> {
    const accountDomain = await this.accountRepo.findById(query.id);
    return AccountDtoMapper.fromDomain(accountDomain);
  }
}
