import { IsString, IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';

export class UpdateServiceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  duration?: number;

  @IsBoolean()
  @IsOptional()
  available?: boolean;
}

