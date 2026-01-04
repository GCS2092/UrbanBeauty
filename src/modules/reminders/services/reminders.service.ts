import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma.service';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * Vérifie toutes les 15 minutes les RDV à venir
   * et envoie des rappels 1h avant
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkUpcomingBookings() {
    this.logger.log('🔔 Vérification des rendez-vous à rappeler...');

    try {
      const now = new Date();
      
      // Fenêtre de rappel : entre 55 et 75 minutes avant le RDV
      // (pour éviter les doublons avec la fréquence de 10 min)
      const minTime = new Date(now.getTime() + 55 * 60 * 1000); // Dans 55 min
      const maxTime = new Date(now.getTime() + 75 * 60 * 1000); // Dans 75 min

      // Trouver les réservations confirmées dans la fenêtre de rappel
      // qui n'ont pas encore reçu de rappel
      const bookingsToRemind = await this.prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          reminderSent: false,
          startTime: {
            gte: minTime,
            lte: maxTime,
          },
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          service: {
            include: {
              provider: true,
            },
          },
        },
      });

      this.logger.log(`📋 ${bookingsToRemind.length} rappel(s) à envoyer`);

      for (const booking of bookingsToRemind) {
        await this.sendBookingReminder(booking);
      }
    } catch (error) {
      this.logger.error('❌ Erreur lors de la vérification des rappels:', error);
    }
  }

  /**
   * Envoie un rappel pour une réservation spécifique
   */
  private async sendBookingReminder(booking: any) {
    try {
      const clientName = booking.clientName || 
        (booking.user?.profile ? `${booking.user.profile.firstName} ${booking.user.profile.lastName}` : 'Client');
      
      const serviceName = booking.service?.name || 'votre service';
      const startTime = new Date(booking.startTime);
      const timeStr = startTime.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // 1. Notifier le CLIENT (si connecté)
      if (booking.userId) {
        await this.notificationsService.sendToUser(booking.userId, {
          title: '⏰ Rappel RDV dans 1h',
          body: `Votre rendez-vous "${serviceName}" est prévu à ${timeStr}`,
          data: {
            type: 'BOOKING_REMINDER',
            bookingId: booking.id,
            bookingNumber: booking.bookingNumber,
          },
        });
        this.logger.log(`✅ Rappel envoyé au client: ${clientName}`);
      }

      // 2. Notifier la COIFFEUSE
      if (booking.service?.providerId) {
        const providerName = booking.service.provider?.firstName || 'Prestataire';
        
        await this.notificationsService.sendToUser(booking.service.providerId, {
          title: '⏰ RDV dans 1h',
          body: `${clientName} - ${serviceName} à ${timeStr}`,
          data: {
            type: 'BOOKING_REMINDER',
            bookingId: booking.id,
            bookingNumber: booking.bookingNumber,
          },
        });
        this.logger.log(`✅ Rappel envoyé au prestataire: ${providerName}`);
      }

      // 3. Marquer le rappel comme envoyé
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { reminderSent: true },
      });

    } catch (error) {
      this.logger.error(`❌ Erreur rappel booking ${booking.id}:`, error);
    }
  }

  /**
   * Méthode manuelle pour tester l'envoi d'un rappel
   */
  async sendManualReminder(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        service: {
          include: {
            provider: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error('Réservation introuvable');
    }

    await this.sendBookingReminder(booking);
    return { message: 'Rappel envoyé' };
  }

  /**
   * Réinitialiser le flag reminderSent (utile pour les tests)
   */
  async resetReminderFlag(bookingId: string) {
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { reminderSent: false },
    });
  }
}

