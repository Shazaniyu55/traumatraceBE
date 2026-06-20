import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  // The mobile app uploads the image itself (e.g. Firebase Storage / S3) and
  // sends us the resulting public URL. We only store the string.
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  photoUrl?: string;
}