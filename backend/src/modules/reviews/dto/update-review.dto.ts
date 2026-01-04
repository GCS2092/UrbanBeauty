import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateReviewDto {
  @IsString()
  @IsOptional()
  comment?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}

