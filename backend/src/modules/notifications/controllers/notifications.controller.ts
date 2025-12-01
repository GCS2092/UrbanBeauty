import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { RegisterTokenDto } from '../dto/register-token.dto';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register-token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async registerToken(
    @CurrentUser() user: any,
    @Body() registerTokenDto: RegisterTokenDto,
  ) {
    return this.notificationsService.registerToken(user.userId, registerTokenDto);
  }

  @Post('send')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    if (sendNotificationDto.userId) {
      return this.notificationsService.sendToUser(
        sendNotificationDto.userId,
        sendNotificationDto,
      );
    }

    if (sendNotificationDto.topic) {
      return this.notificationsService.sendToTopic(sendNotificationDto);
    }

    throw new Error('userId or topic is required');
  }

  @Post('send-to-multiple')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async sendToMultipleUsers(
    @Body() body: { userIds: string[] } & SendNotificationDto,
  ) {
    const { userIds, ...sendNotificationDto } = body;
    return this.notificationsService.sendToMultipleUsers(userIds, sendNotificationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserNotifications(@CurrentUser() user: any) {
    return this.notificationsService.getUserNotifications(user.userId);
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@CurrentUser() user: any) {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(id, user.userId);
  }

  @Patch('mark-all-read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteNotification(@Param('id') id: string, @CurrentUser() user: any) {
    return this.notificationsService.deleteNotification(id, user.userId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAllNotifications(@CurrentUser() user: any) {
    return this.notificationsService.deleteAllNotifications(user.userId);
  }

  @Delete('read/clear')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteReadNotifications(@CurrentUser() user: any) {
    return this.notificationsService.deleteReadNotifications(user.userId);
  }
}

