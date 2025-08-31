import { Command } from '@nestjs/cqrs';
import { LogInAccountDto } from 'src/modules/account/presentation/dtos/LogInAccount.dto';
import { AuthPayload } from 'src/shared/auth/AuthPayload.interface';

export class LogInAccountCommand extends Command<{
  accessToken: string;
  refreshToken: string;
}> {
  constructor(
    public readonly data: LogInAccountDto
  ) {
    super();
  }
}
