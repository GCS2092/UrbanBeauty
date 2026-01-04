import { IsString, IsNotEmpty } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  participant2Id: string; // L'autre participant (participant1 sera l'utilisateur connecté)
}

