import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getUserFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            images: true,
            category: true,
            seller: {
              include: {
                profile: true,
              },
            },
          },
        },
        service: {
          include: {
            images: true,
            provider: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return favorites;
  }

  async addProductToFavorites(userId: string, productId: string) {
    // Vérifier que le produit existe
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }

    // Vérifier si déjà en favoris
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Ce produit est déjà dans vos favoris');
    }

    return this.prisma.favorite.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: {
          include: {
            images: true,
            category: true,
          },
        },
      },
    });
  }

  async addServiceToFavorites(userId: string, serviceId: string) {
    // Vérifier que le service existe
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service introuvable');
    }

    // Vérifier si déjà en favoris
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_serviceId: {
          userId,
          serviceId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Ce service est déjà dans vos favoris');
    }

    return this.prisma.favorite.create({
      data: {
        userId,
        serviceId,
      },
      include: {
        service: {
          include: {
            images: true,
            provider: true,
          },
        },
      },
    });
  }

  async removeFromFavorites(userId: string, favoriteId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { id: favoriteId },
    });

    if (!favorite) {
      throw new NotFoundException('Favori introuvable');
    }

    if (favorite.userId !== userId) {
      throw new NotFoundException('Favori introuvable');
    }

    return this.prisma.favorite.delete({
      where: { id: favoriteId },
    });
  }

  async removeProductFromFavorites(userId: string, productId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Ce produit n\'est pas dans vos favoris');
    }

    return this.prisma.favorite.delete({
      where: { id: favorite.id },
    });
  }

  async removeServiceFromFavorites(userId: string, serviceId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_serviceId: {
          userId,
          serviceId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundException('Ce service n\'est pas dans vos favoris');
    }

    return this.prisma.favorite.delete({
      where: { id: favorite.id },
    });
  }

  async isProductFavorite(userId: string, productId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return !!favorite;
  }

  async isServiceFavorite(userId: string, serviceId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_serviceId: {
          userId,
          serviceId,
        },
      },
    });

    return !!favorite;
  }

  async getFavoritesCount(userId: string) {
    const [products, services] = await Promise.all([
      this.prisma.favorite.count({
        where: { userId, productId: { not: null } },
      }),
      this.prisma.favorite.count({
        where: { userId, serviceId: { not: null } },
      }),
    ]);

    return {
      products,
      services,
      total: products + services,
    };
  }

  async clearAllFavorites(userId: string) {
    const result = await this.prisma.favorite.deleteMany({
      where: { userId },
    });

    return {
      message: `${result.count} favori(s) supprimé(s)`,
      count: result.count,
    };
  }
}

