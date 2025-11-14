import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const services = await this.prisma.service.findMany({
      include: {
        provider: {
          include: {
            user: true,
          },
        },
        images: true,
      },
      where: {
        available: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Formater la réponse pour correspondre au format attendu par le frontend
    return services.map(service => ({
      ...service,
      provider: service.provider ? {
        id: service.provider.id,
        firstName: service.provider.firstName || '',
        lastName: service.provider.lastName || '',
        rating: service.provider.rating || null,
      } : null,
    }));
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          include: {
            user: true,
          },
        },
        images: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service introuvable');
    }

    // Formater la réponse pour correspondre au format attendu par le frontend
    return {
      ...service,
      provider: service.provider ? {
        id: service.provider.id,
        firstName: service.provider.firstName || '',
        lastName: service.provider.lastName || '',
        rating: service.provider.rating || null,
      } : null,
    };
  }

  async create(createServiceDto: CreateServiceDto, userId: string) {
    // Trouver le profil de l'utilisateur
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profil introuvable. Veuillez compléter votre profil.');
    }

    return this.prisma.service.create({
      data: {
        ...createServiceDto,
        providerId: profile.id,
        available: createServiceDto.available ?? true,
      },
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
    });
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, userId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        provider: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service introuvable');
    }

    // Vérifier que l'utilisateur est le prestataire
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile || service.providerId !== profile.id) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce service');
    }

    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
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
    });
  }

  async remove(id: string, userId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service introuvable');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile || service.providerId !== profile.id) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce service');
    }

    await this.prisma.service.delete({
      where: { id },
    });

    return { message: 'Service supprimé avec succès' };
  }
}

