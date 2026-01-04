import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    // Utiliser les variables d'environnement pour la production
    const serviceAccount = {
      projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      privateKey: this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
      clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
    };

    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
      console.warn('⚠️ Firebase credentials not configured. Push notifications will be disabled.');
      return;
    }

    if (!this.firebaseApp) {
      try {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
        console.log('✅ Firebase Admin initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing Firebase Admin:', error);
      }
    }
  }

  async sendNotification(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    if (!this.firebaseApp) {
      throw new Error('Firebase not initialized');
    }

    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      data: data ? Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ) : {},
      token,
      webpush: {
        notification: {
          title,
          body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
        },
      },
    };

    try {
      const response = await admin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error: any) {
      console.error('Error sending notification:', error);
      if (error.code === 'messaging/registration-token-not-registered') {
        // Token invalide, devrait être supprimé de la DB
        return { success: false, error: 'TOKEN_INVALID' };
      }
      throw error;
    }
  }

  async sendNotificationToMultiple(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    if (!this.firebaseApp) {
      throw new Error('Firebase not initialized');
    }

    if (tokens.length === 0) {
      return { successCount: 0, failureCount: 0, responses: [] };
    }

    const message: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body,
      },
      data: data ? Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ) : {},
      tokens,
      webpush: {
        notification: {
          title,
          body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
        },
      },
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error) {
      console.error('Error sending notifications:', error);
      throw error;
    }
  }

  async sendToTopic(topic: string, title: string, body: string, data?: Record<string, string>) {
    if (!this.firebaseApp) {
      throw new Error('Firebase not initialized');
    }

    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      data: data ? Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, String(value)])
      ) : {},
      topic,
    };

    try {
      const response = await admin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending to topic:', error);
      throw error;
    }
  }
}

