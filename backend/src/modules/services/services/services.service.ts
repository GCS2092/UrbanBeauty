import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';

// Fonction utilitaire pour générer un slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début/fin
}

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

    const { images, ...serviceData } = createServiceDto;

    return this.prisma.service.create({
      data: {
        ...serviceData,
        slug: generateSlug(createServiceDto.name),
        providerId: profile.id,
        available: createServiceDto.available ?? true,
        images: images && images.length > 0 ? {
          create: images.map((img, index) => ({
            url: img.url,
            type: (img.type || 'URL') as 'URL' | 'UPLOADED',
            alt: img.alt || createServiceDto.name,
            title: img.title || createServiceDto.name,
            order: img.order ?? index,
            isPrimary: img.isPrimary ?? (index === 0),
          })),
        } : undefined,
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

  async update(id: string, updateServiceDto: UpdateServiceDto, userId?: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        provider: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service introuvable');
    }

    // Si userId est fourni, vérifier que l'utilisateur est le prestataire (sauf admin)
    if (userId) {
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
      });

      if (!profile || service.providerId !== profile.id) {
        throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce service');
      }
    }

    const { images, ...serviceData } = updateServiceDto;

    // Si des images sont fournies, supprimer les anciennes et créer les nouvelles
    if (images !== undefined) {
      // Supprimer les anciennes images
      await this.prisma.image.deleteMany({
        where: { serviceId: id },
      });
    }

    return this.prisma.service.update({
      where: { id },
      data: {
        ...serviceData,
        ...(images && images.length > 0 ? {
          images: {
            create: images.map((img, index) => ({
              url: img.url,
              type: (img.type || 'URL') as 'URL' | 'UPLOADED',
              alt: img.alt || service.name,
              title: img.title || service.name,
              order: img.order ?? index,
              isPrimary: img.isPrimary ?? (index === 0),
            })),
          },
        } : {}),
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

  async remove(id: string, userId?: string) {
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new NotFoundException('Service introuvable');
    }

    // Si userId est fourni, vérifier que l'utilisateur est le prestataire (sauf admin)
    if (userId) {
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
      });

      if (!profile || service.providerId !== profile.id) {
        throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce service');
      }
    }

    await this.prisma.service.delete({
      where: { id },
    });

    return { message: 'Service supprimé avec succès' };
  }
}

