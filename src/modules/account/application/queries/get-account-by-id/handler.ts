import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAccountByIdQuery } from './query';
import { AccountRepository } from 'src/modules/account/infrastructure/repositories/account.repo';
import { AccountDto } from 'src/modules/account/presentation/dtos/response/account.response.dto';
import { plainToInstance } from 'class-transformer';
import { AccountDtoMapper } from '../../mappers/account.mapper';
import { Inject } from '@nestjs/common';
import { ACCOUNT_REPO } from 'src/modules/account/domain/repositories/account.repo.interface';

@QueryHandler(GetAccountByIdQuery)
export class GetAccountOfCurrentUserQueryHandler
    implements IQueryHandler<GetAccountByIdQuery>
{
    constructor(
        @Inject(ACCOUNT_REPO)
        private readonly accountRepo: AccountRepository) {}

    async execute(query: GetAccountByIdQuery): Promise<AccountDto | null> {
        const accountDomain = await this.accountRepo.findById(query.id);
        if (!accountDomain) return null;
        return AccountDtoMapper.fromDomain(accountDomain);
    }
}
