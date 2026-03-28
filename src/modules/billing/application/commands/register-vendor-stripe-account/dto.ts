import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterVendorStripeAccountDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  returnUrl?: string;

  @IsString()
  @IsOptional()
  refreshUrl?: string;
}
