import { Type } from 'class-transformer';
import {
  IsInt,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';

export class PaginatedDto<T> {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  data: T[];

  @IsInt()
  itemsCount: number;

  @IsInt()
  totalPages: number;
  @IsBoolean()
  hasNextPage: boolean;

  @IsBoolean()
  hasPreviousPage: boolean;

  constructor(
    data: T[],
    itemsCount: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPreviousPage: boolean,
  ) {
    this.data = data;
    this.itemsCount = itemsCount;
    this.totalPages = totalPages;
    this.hasNextPage = hasNextPage;
    this.hasPreviousPage = hasPreviousPage;
  }
}
