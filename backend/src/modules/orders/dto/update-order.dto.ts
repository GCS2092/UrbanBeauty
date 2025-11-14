import { IsString, IsOptional, IsEnum } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  cancellationReason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

