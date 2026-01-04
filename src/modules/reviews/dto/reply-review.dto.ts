import { IsString, IsNotEmpty } from 'class-validator';

export class ReplyReviewDto {
  @IsString()
  @IsNotEmpty({ message: 'La réponse ne peut pas être vide' })
  reply: string;
}

