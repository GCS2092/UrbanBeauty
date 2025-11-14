import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profil introuvable');
    }

    return profile;
  }

  async update(userId: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.findOne(userId);

    return this.prisma.profile.update({
      where: { userId },
      data: updateProfileDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findAllProviders() {
    // Récupérer tous les utilisateurs avec le rôle COIFFEUSE et leurs profils
    const providers = await this.prisma.profile.findMany({
      where: {
        user: {
          role: 'COIFFEUSE',
        },
        isProvider: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        services: {
          where: {
            available: true,
          },
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            images: {
              take: 1,
              select: {
                url: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 3, // Limiter à 3 services pour l'affichage
        },
      },
      orderBy: [
        { rating: 'desc' },
        { totalBookings: 'desc' },
      ],
    });

    // Calculer les statistiques pour chaque prestataire
    return providers.map(provider => ({
      id: provider.id,
      firstName: provider.firstName,
      lastName: provider.lastName,
      phone: provider.phone,
      city: provider.city,
      country: provider.country,
      avatar: provider.avatar,
      bio: provider.bio,
      specialties: provider.specialties || [],
      experience: provider.experience,
      rating: provider.rating || 0,
      totalBookings: provider.totalBookings,
      completedBookings: provider.completedBookings,
      cancellationRate: provider.cancellationRate,
      servicesCount: provider.services.length,
      services: provider.services,
      user: provider.user,
    }));
  }

  async findByProviderId(providerId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id: providerId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        services: {
          include: {
            images: true,
          },
          where: {
            available: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        portfolio: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Prestataire introuvable');
    }

    // Récupérer les avis pour ce prestataire (via les services)
    const serviceIds = profile.services.map(s => s.id);
    const reviews = await this.prisma.review.findMany({
      where: {
        serviceId: {
          in: serviceIds,
        },
        isPublished: true,
      },
      include: {
        user: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return {
      ...profile,
      reviews,
    };
  }
}

