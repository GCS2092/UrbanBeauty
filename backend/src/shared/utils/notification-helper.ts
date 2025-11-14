import { FirebaseService } from '../../modules/firebase/firebase.service';
import { PrismaService } from '../../prisma.service';

/**
 * Helper pour envoyer des notifications automatiquement
 * Utilisé dans les services (Orders, Bookings, etc.)
 */
export class NotificationHelper {
  constructor(
    private firebaseService: FirebaseService,
    private prisma: PrismaService,
  ) {}

  /**
   * Récupère le token FCM d'un utilisateur
   * TODO: Ajouter un champ fcmToken dans Profile ou créer une table NotificationToken
   */
  async getUserToken(userId: string): Promise<string | null> {
    // Pour l'instant, on retourne null car on n'a pas encore de champ dédié
    // Vous devrez ajouter un champ fcmToken dans Profile
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { userId: true }, // TODO: ajouter fcmToken ici
    });

    // TODO: return profile?.fcmToken || null;
    return null;
  }

  /**
   * Envoie une notification à un utilisateur
   */
  async notifyUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<boolean> {
    try {
      const token = await this.getUserToken(userId);
      if (!token) {
        console.log(`No FCM token found for user ${userId}`);
        return false;
      }

      await this.firebaseService.sendNotification(token, title, body, data);
      return true;
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Envoie une notification de commande créée
   */
  async notifyOrderCreated(userId: string, orderNumber: string, orderId: string) {
    return this.notifyUser(
      userId,
      'Commande confirmée',
      `Votre commande #${orderNumber} a été enregistrée avec succès`,
      {
        type: 'ORDER_CREATED',
        orderId,
        orderNumber,
      },
    );
  }

  /**
   * Envoie une notification de commande mise à jour
   */
  async notifyOrderUpdated(userId: string, orderNumber: string, status: string, orderId: string) {
    const statusLabels: Record<string, string> = {
      PROCESSING: 'en traitement',
      PAID: 'payée',
      SHIPPED: 'expédiée',
      DELIVERED: 'livrée',
      CANCELLED: 'annulée',
    };

    return this.notifyUser(
      userId,
      'Commande mise à jour',
      `Votre commande #${orderNumber} est maintenant ${statusLabels[status] || status}`,
      {
        type: 'ORDER_UPDATED',
        orderId,
        orderNumber,
        status,
      },
    );
  }

  /**
   * Envoie une notification de réservation créée
   */
  async notifyBookingCreated(userId: string, bookingNumber: string, serviceName: string, bookingId: string) {
    return this.notifyUser(
      userId,
      'Réservation confirmée',
      `Votre réservation #${bookingNumber} pour "${serviceName}" a été enregistrée`,
      {
        type: 'BOOKING_CREATED',
        bookingId,
        bookingNumber,
      },
    );
  }

  /**
   * Envoie une notification de réservation mise à jour (pour le prestataire)
   */
  async notifyBookingUpdated(
    providerId: string,
    bookingNumber: string,
    clientName: string,
    status: string,
    bookingId: string,
  ) {
    const statusLabels: Record<string, string> = {
      CONFIRMED: 'confirmée',
      CANCELLED: 'annulée',
      COMPLETED: 'terminée',
    };

    return this.notifyUser(
      providerId,
      'Réservation mise à jour',
      `La réservation #${bookingNumber} de ${clientName} est maintenant ${statusLabels[status] || status}`,
      {
        type: 'BOOKING_UPDATED',
        bookingId,
        bookingNumber,
        status,
      },
    );
  }
}

