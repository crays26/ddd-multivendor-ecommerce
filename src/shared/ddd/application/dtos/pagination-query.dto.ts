import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional } from 'class-validator';

export class PaginationQueryDto {
    @IsOptional()
    @Transform(({ value }) => Number(value ?? 1))
    @IsInt()
    page = 1;

    @IsOptional()
    @Transform(({ value }) => Number(value ?? 10))
    @IsInt()
    limit = 10;

    @IsOptional()
    @IsIn(['name', 'createdAt', 'updatedAt'])
    orderBy: 'name' | 'createdAt' | 'updatedAt' = 'createdAt';

    @IsOptional()
    @IsIn(['asc', 'desc'])
    sort: 'asc' | 'desc' = 'desc';
}
