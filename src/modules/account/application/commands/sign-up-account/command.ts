import { Command } from "@nestjs/cqrs";
import { SignUpAccountDto } from "src/modules/account/presentation/dtos/SignUpAccount.dto";

export class SignUpAccountCommand extends Command<string> {
  constructor(
    public readonly data: SignUpAccountDto
  ) {
    super();
  }
}
