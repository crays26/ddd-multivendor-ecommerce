import { isArray, ValidateNested } from "class-validator";
import { Book } from "../../infrastructure/entities/book.entity";
import { IsArray } from "class-validator";
import { Expose, Type } from 'class-transformer';
import { Validate } from "class-validator";

export class BookDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  account: number;


}

export class AccountDto {
  @Expose()
  id: number;

  @Expose()
  username: string;
  
  @Expose()
  password: string;

  @Expose()
  email: string;

  @Expose()
  @Type(() => BookDto)
  @IsArray()
  @ValidateNested({ each: true })
  books: BookDto[];
}
