import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  totalAmount?: number;

  @IsString()
  @IsOptional()
  userId?: string;
}

