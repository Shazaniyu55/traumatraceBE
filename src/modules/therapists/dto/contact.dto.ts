import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class ContactTherapistDto {
  @IsString()
  @MinLength(1)
  message: string;

  // Optional overrides; default to the authenticated user's name/email.
  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsEmail()
  fromEmail?: string;
}