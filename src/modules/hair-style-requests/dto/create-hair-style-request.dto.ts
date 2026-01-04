import { IsString, IsOptional, IsInt, IsDateString, Min } from 'class-validator';

export class CreateHairStyleRequestDto {
  @IsString()
  @IsOptional()
  lookbookItemId?: string;

  @IsString()
  @IsOptional()
  lookbookItemName?: string;

  @IsString()
  clientName: string;

  @IsString()
  clientPhone: string;

  @IsString()
  @IsOptional()
  clientEmail?: string;

  @IsString()
  hairStyleType: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  numberOfBraids?: number;

  @IsString()
  @IsOptional()
  braidType?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  numberOfPackages?: number;

  @IsDateString()
  @IsOptional()
  preferredTime?: string;

  @IsDateString()
  @IsOptional()
  preferredDate?: string;

  @IsString()
  @IsOptional()
  additionalDetails?: string;
}

