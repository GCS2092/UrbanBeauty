import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateMaintenanceSettingsDto {
  @IsBoolean()
  @IsOptional()
  isBookingDisabled?: boolean;

  @IsString()
  @IsOptional()
  bookingMessage?: string;

  @IsBoolean()
  @IsOptional()
  isChatDisabled?: boolean;

  @IsString()
  @IsOptional()
  chatMessage?: string;

  @IsBoolean()
  @IsOptional()
  isPrestatairesDisabled?: boolean;

  @IsString()
  @IsOptional()
  prestatairesMessage?: string;

  @IsBoolean()
  @IsOptional()
  isAuthDisabled?: boolean;

  @IsString()
  @IsOptional()
  authMessage?: string;
}

