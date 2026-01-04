import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum HairStyleRequestStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export class UpdateHairStyleRequestDto {
  @IsString()
  @IsEnum(HairStyleRequestStatus)
  @IsOptional()
  status?: string;
}

