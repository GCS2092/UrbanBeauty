import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { FirebaseService } from '../../firebase/firebase.service';
import { RegisterTokenDto } from '../dto/register-token.dto';
import { SendNotificationDto } from '../dto/send-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private firebaseService: FirebaseService,
  ) {}

  async registerToken(userId: string, registerTokenDto: RegisterTokenDto) {
    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    // Enregistrer ou mettre à jour le token FCM
    await this.prisma.notificationToken.upsert({
      where: { userId },
      update: { token: registerTokenDto.token },
      create: { userId, token: registerTokenDto.token },
    });

    return { success: true, message: 'Token FCM enregistré avec succès' };
  }

  async getUserFCMToken(userId: string): Promise<string | null> {
    const notificationToken = await this.prisma.notificationToken.findUnique({
      where: { userId },
    });
    return notificationToken?.token || null;
  }

  async sendToUser(userId: string, sendNotificationDto: SendNotificationDto) {
    const token = await this.getUserFCMToken(userId);
    
    if (!token) {
      throw new NotFoundException('Token FCM non trouvé pour cet utilisateur');
    }

    return this.firebaseService.sendNotification(
      token,
      sendNotificationDto.title,
      sendNotificationDto.body,
      sendNotificationDto.data,
    );
  }

  async sendToMultipleUsers(userIds: string[], sendNotificationDto: SendNotificationDto) {
    const tokens: string[] = [];
    
    for (const userId of userIds) {
      const token = await this.getUserFCMToken(userId);
      if (token) {
        tokens.push(token);
      }
    }

    if (tokens.length === 0) {
      return { successCount: 0, failureCount: 0, responses: [] };
    }

    return this.firebaseService.sendNotificationToMultiple(
      tokens,
      sendNotificationDto.title,
      sendNotificationDto.body,
      sendNotificationDto.data,
    );
  }

  async sendToTopic(sendNotificationDto: SendNotificationDto) {
    if (!sendNotificationDto.topic) {
      throw new Error('Topic is required');
    }

    return this.firebaseService.sendToTopic(
      sendNotificationDto.topic,
      sendNotificationDto.title,
      sendNotificationDto.body,
      sendNotificationDto.data,
    );
  }
}

