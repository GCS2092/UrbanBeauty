import { IsString, IsNotEmpty, IsDateString, IsOptional, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }) => value?.trim() || undefined)
  location?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  clientName?: string; // Nom complet du client (pour réservations guest)

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  clientPhone?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  clientEmail?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  notes?: string;
}

