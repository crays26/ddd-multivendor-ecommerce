import { Command } from '@nestjs/cqrs';
import { LogInAccountDto } from 'src/modules/account/presentation/dtos/LogInAccount.dto';
import { JwtTokenPair } from 'src/shared/auth/types/jwt-token-pair.type';
import { AuthPayload } from 'src/shared/auth/types/auth-payload.type';

export class LogInAccountCommand extends Command<{
  tokenPair: JwtTokenPair;
  user: AuthPayload;
}> {
  constructor(public readonly data: LogInAccountDto) {
    super();
  }
}
