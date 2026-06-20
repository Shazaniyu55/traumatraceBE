import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class RegisterTherapistDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  // Full street address — used for geocoding when lat/lng are not supplied.
  @IsOptional()
  @IsString()
  addressLine?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  // The app may pass coordinates directly (e.g. from a place picker). If
  // present, these are used as-is and no geocoding call is made.
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}