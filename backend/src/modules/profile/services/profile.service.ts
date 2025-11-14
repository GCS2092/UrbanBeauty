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

