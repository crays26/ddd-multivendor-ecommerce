import { Command } from '@nestjs/cqrs';
import { LogInAccountDto } from 'src/modules/account/presentation/dtos/LogInAccount.dto';
import {JwtTokenPair} from "src/shared/auth/types/jwt-token-pair.type";

export class LogInAccountCommand extends Command<JwtTokenPair> {
  constructor(
    public readonly data: LogInAccountDto
  ) {
    super();
  }
}
