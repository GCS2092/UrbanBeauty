import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsDateString, Min, Max } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  discountType: 'PERCENTAGE' | 'FIXED';

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minPurchase?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscount?: number;

  @IsDateString()
  validFrom: string;

  @IsDateString()
  validUntil: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  usageLimit?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  userLimit?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  applicableTo?: string;
}

