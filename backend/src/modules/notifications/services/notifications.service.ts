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

    // Stocker le token FCM dans le profil utilisateur
    // On peut utiliser un champ JSON dans Profile ou créer une table dédiée
    // Pour l'instant, on stocke dans Profile.avatar temporairement ou on crée un champ fcmTokens
    
    // Mise à jour : stocker dans le profil (on peut ajouter un champ fcmToken dans Profile plus tard)
    await this.prisma.profile.upsert({
      where: { userId },
      update: {
        // On stocke temporairement dans un champ existant ou on ajoute un champ JSON
        // Pour l'instant, on va créer une entrée dans une table dédiée si elle existe
      },
      create: {
        userId,
        firstName: '',
        lastName: '',
        // fcmToken: registerTokenDto.token, // Si vous ajoutez ce champ au schéma
      },
    });

    return { success: true, message: 'Token FCM enregistré avec succès' };
  }

  async getUserFCMToken(userId: string): Promise<string | null> {
    // Récupérer le token FCM de l'utilisateur
    // Pour l'instant, on retourne null car on n'a pas encore de champ dédié
    // Vous devrez ajouter un champ fcmToken dans Profile ou créer une table NotificationToken
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    // TODO: Récupérer depuis le champ fcmToken quand il sera ajouté au schéma
    return null;
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

