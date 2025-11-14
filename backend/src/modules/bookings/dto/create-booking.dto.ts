import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // Date du rendez-vous (YYYY-MM-DD)

  @IsDateString()
  @IsNotEmpty()
  startTime: string; // Heure de début (ISO string)

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  clientPhone?: string;

  @IsString()
  @IsOptional()
  clientEmail?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

