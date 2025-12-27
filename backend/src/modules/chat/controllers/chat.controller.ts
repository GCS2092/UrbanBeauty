import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { CreateMessageDto } from '../dto/create-message.dto';
import { CreateConversationDto } from '../dto/create-conversation.dto';
import { MaintenanceService } from '../../maintenance/services/maintenance.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly maintenanceService: MaintenanceService,
  ) {}

  @Get('conversations')
  getConversations(@CurrentUser() user: any) {
    return this.chatService.getUserConversations(user.userId);
  }

  @Get('conversations/:id/messages')
  getMessages(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.getConversationMessages(id, user.userId);
  }

  @Post('conversations')
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @CurrentUser() user: any,
  ) {
    // Vérifier si le chat est désactivé
    const chatStatus = await this.maintenanceService.isChatDisabled();
    if (chatStatus.disabled) {
      throw new ServiceUnavailableException(
        chatStatus.message || 'Le chat est temporairement désactivé',
      );
    }
    
    return this.chatService.createConversation(user.userId, createConversationDto);
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body() createMessageDto: CreateMessageDto,
    @CurrentUser() user: any,
  ) {
    // Vérifier si le chat est désactivé
    const chatStatus = await this.maintenanceService.isChatDisabled();
    if (chatStatus.disabled) {
      throw new ServiceUnavailableException(
        chatStatus.message || 'Le chat est temporairement désactivé',
      );
    }
    
    return this.chatService.sendMessage(id, user.userId, createMessageDto);
  }
}

