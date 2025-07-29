import { IsEmail, IsNotEmpty, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
export class CreateAccountDto {

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}

