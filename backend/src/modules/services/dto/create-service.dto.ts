import { IsString, IsNumber, IsNotEmpty, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsBoolean()
  @IsOptional()
  available?: boolean;
}

