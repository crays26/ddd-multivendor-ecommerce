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

export class CreateBookDto {

  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  name: string;

}

