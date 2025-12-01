import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserStatusDto {
  @IsBoolean()
  isActive: boolean;

  @IsString()
  @IsOptional()
  blockReason?: string; // Message expliquant le motif du blocage
}

