import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AddAddressDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  street: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  unit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  region: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  postalCode: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(3)
  countryCode: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  label: string;
}
