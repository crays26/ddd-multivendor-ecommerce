import { Command } from "@nestjs/cqrs";

export class SignUpAccountCommand extends Command<string> {
  constructor(
    public readonly data: {
      readonly email: string;
      readonly username: string;
      readonly password: string;
    },
  ) {
    super();
  }
}
