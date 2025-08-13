import { isArray, ValidateNested } from "class-validator";
import { IsArray } from "class-validator";
import { Expose, Type } from 'class-transformer';


export class RoleDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
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
  @Type(() => RoleDto)
  @IsArray()
  @ValidateNested({ each: true })
  roles: RoleDto[];
}
