import { Query } from '@nestjs/cqrs';
import { AccountDto } from 'src/modules/account/presentation/dtos/response/account.response.dto';

export class GetAccountOfCurrentUserQuery extends Query<AccountDto> {
  constructor(public readonly id: string) {
    super();
  }
}
