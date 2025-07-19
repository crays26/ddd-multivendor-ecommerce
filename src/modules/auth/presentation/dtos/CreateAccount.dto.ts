import { IsEmail, IsNotEmpty } from "class-validator";
export class CreateAccountDto {

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;
}
