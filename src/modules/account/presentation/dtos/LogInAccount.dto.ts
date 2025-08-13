import { IsEmail, IsNotEmpty } from "class-validator";

export class LogInAccountDto {

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}

