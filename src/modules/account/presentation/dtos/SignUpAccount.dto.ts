import { IsEmail, IsNotEmpty } from "class-validator";

export class SignUpAccountDto {

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}

