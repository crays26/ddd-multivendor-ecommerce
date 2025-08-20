import { Command } from '@nestjs/cqrs';
import { AuthPayload } from 'src/shared/auth/AuthPayload.interface';

export class LogInAccountCommand extends Command<{
  accessToken: string;
  refreshToken: string;
}> {
  constructor(
    public readonly data: {
      readonly email: string;
      readonly password: string;
    },
  ) {
    super();
  }
}
