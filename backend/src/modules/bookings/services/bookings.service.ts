import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';

// Fonction utilitaire pour générer un numéro de réservation
function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RVD-${timestamp}-${random}`;
}

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string, providerId?: string) {
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (providerId) {
      // Trouver les réservations pour les services d'un prestataire
      where.service = {
        providerId,
      };
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        service: {
          include: {
            provider: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
            images: true,
          },
        },
        user: {
          include: {
            profile: true,
          },
        },
        payment: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        service: {
          include: {
            provider: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
            images: true,
          },
        },
        user: {
          include: {
            profile: true,
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Réservation introuvable');
    }

    return booking;
  }

  async getAvailableSlots(serviceId: string, date: string) {
    // Vérifier que le service existe
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service introuvable');
    }

    // Récupérer toutes les réservations pour ce service à cette date
    const bookings = await this.prisma.booking.findMany({
      where: {
        serviceId,
        date: new Date(date),
        status: {
          not: 'CANCELLED',
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Générer les créneaux disponibles (9h-18h par défaut, avec des créneaux de la durée du service)
    const startHour = 9; // 9h
    const endHour = 18; // 18h
    const slotDuration = service.duration; // Durée du service en minutes
    const slots: Array<{ time: string; available: boolean }> = [];

    // Créer les créneaux de 30 minutes
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = new Date(`${date}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`);
        const slotEndTime = new Date(slotTime.getTime() + slotDuration * 60000);

        // Vérifier si le créneau chevauche avec une réservation existante
        const isAvailable = !bookings.some(booking => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          
          // Vérifier si le créneau chevauche avec la réservation
          return (slotTime < bookingEnd && slotEndTime > bookingStart);
        });

        // Vérifier que le créneau ne dépasse pas l'heure de fin
        if (slotEndTime.getHours() <= endHour) {
          slots.push({
            time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
            available: isAvailable,
          });
        }
      }
    }

    return {
      serviceId,
      date,
      duration: slotDuration,
      slots,
      bookedSlots: bookings.map(b => ({
        start: new Date(b.startTime).toISOString(),
        end: new Date(b.endTime).toISOString(),
      })),
    };
  }

  async create(createBookingDto: CreateBookingDto, userId?: string) {
    // Vérifier que le service existe
    const service = await this.prisma.service.findUnique({
      where: { id: createBookingDto.serviceId },
      include: {
        provider: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service introuvable');
    }

    if (!service.available) {
      throw new BadRequestException('Ce service n\'est pas disponible pour le moment');
    }

    // Pour les réservations guest, vérifier que les informations client sont fournies
    if (!userId && (!createBookingDto.clientName || !createBookingDto.clientEmail || !createBookingDto.clientPhone)) {
      throw new BadRequestException('Les informations client (nom, email, téléphone) sont requises pour les réservations sans compte');
    }

    const bookingDate = new Date(createBookingDto.date);
    const startTime = new Date(createBookingDto.startTime);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    // Vérifier les limites de réservation
    if (service.maxBookingsPerDay) {
      const bookingsOnDate = await this.prisma.booking.count({
        where: {
          serviceId: service.id,
          date: bookingDate,
          status: {
            not: 'CANCELLED',
          },
        },
      });

      if (bookingsOnDate >= service.maxBookingsPerDay) {
        throw new BadRequestException('Le nombre maximum de réservations pour ce jour est atteint');
      }
    }

    // Vérifier les jours d'avance
    if (service.advanceBookingDays) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + service.advanceBookingDays);

      if (bookingDate > maxDate) {
        throw new BadRequestException(
          `Vous ne pouvez pas réserver plus de ${service.advanceBookingDays} jours à l'avance`
        );
      }
    }

    return this.prisma.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        userId: userId || null,
        serviceId: createBookingDto.serviceId,
        date: bookingDate,
        startTime,
        endTime,
        location: createBookingDto.location,
        clientName: createBookingDto.clientName,
        clientPhone: createBookingDto.clientPhone,
        clientEmail: createBookingDto.clientEmail,
        notes: createBookingDto.notes,
      },
      include: {
        service: {
          include: {
            provider: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, userId?: string) {
    const booking = await this.findOne(id);

    // Vérifier les permissions
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });

      // L'utilisateur peut modifier sa propre réservation
      // Le prestataire peut modifier les réservations de ses services
      // L'admin peut tout modifier
      if (user?.role !== 'ADMIN') {
        if (booking.userId !== userId) {
          const service = await this.prisma.service.findUnique({
            where: { id: booking.serviceId },
            include: {
              provider: true,
            },
          });

          if (!service || service.providerId !== user?.profile?.id) {
            throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette réservation');
          }
        }
      }
    }

    const updateData: any = { ...updateBookingDto };

    // Si la date ou l'heure change, recalculer endTime
    if (updateBookingDto.date || updateBookingDto.startTime) {
      const service = await this.prisma.service.findUnique({
        where: { id: booking.serviceId },
      });

      if (service) {
        const newDate = updateBookingDto.date ? new Date(updateBookingDto.date) : booking.date;
        const newStartTime = updateBookingDto.startTime ? new Date(updateBookingDto.startTime) : booking.startTime;
        updateData.endTime = new Date(newStartTime.getTime() + service.duration * 60000);
        updateData.date = newDate;
        updateData.startTime = newStartTime;
      }
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateData,
      include: {
        service: {
          include: {
            provider: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
        user: {
          include: {
            profile: true,
          },
        },
      },
    });
  }

  async remove(id: string, userId?: string) {
    const booking = await this.findOne(id);

    // Vérifier les permissions
    if (userId && booking.userId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (user?.role !== 'ADMIN') {
        throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer cette réservation');
      }
    }

    return this.prisma.booking.delete({
      where: { id },
    });
  }
}

