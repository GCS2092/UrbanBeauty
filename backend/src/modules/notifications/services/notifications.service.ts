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
    // Enregistrer la notification dans la base de données
    await this.prisma.notification.create({
      data: {
        userId,
        title: sendNotificationDto.title,
        body: sendNotificationDto.body,
        type: sendNotificationDto.data?.type || null,
        data: sendNotificationDto.data ? JSON.stringify(sendNotificationDto.data) : null,
      },
    });

    // Envoyer la notification FCM si le token existe
    const token = await this.getUserFCMToken(userId);
    
    if (token) {
      try {
        await this.firebaseService.sendNotification(
          token,
          sendNotificationDto.title,
          sendNotificationDto.body,
          sendNotificationDto.data,
        );
      } catch (error) {
        // Ne pas bloquer si l'envoi FCM échoue, la notification est déjà enregistrée
        console.error('Erreur lors de l\'envoi FCM:', error);
      }
    }

    return { success: true, message: 'Notification envoyée' };
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

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification introuvable');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification introuvable');
    }

    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  async deleteAllNotifications(userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: { userId },
    });

    return {
      message: `${result.count} notification(s) supprimée(s)`,
      count: result.count,
    };
  }

  async deleteReadNotifications(userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    return {
      message: `${result.count} notification(s) lue(s) supprimée(s)`,
      count: result.count,
    };
  }
}

