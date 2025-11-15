import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { ReplyReviewDto } from '../dto/reply-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    // Vérifier qu'un produit OU un service est spécifié
    if (!createReviewDto.productId && !createReviewDto.serviceId) {
      throw new BadRequestException('Un produit ou un service doit être spécifié');
    }

    if (createReviewDto.productId && createReviewDto.serviceId) {
      throw new BadRequestException('Un seul produit ou service peut être spécifié');
    }

    // Vérifier que le produit ou service existe
    if (createReviewDto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: createReviewDto.productId },
      });
      if (!product) {
        throw new NotFoundException('Produit introuvable');
      }

      // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
      const existingReview = await this.prisma.review.findFirst({
        where: {
          userId,
          productId: createReviewDto.productId,
        },
      });

      if (existingReview) {
        throw new BadRequestException('Vous avez déjà laissé un avis pour ce produit');
      }

      // Vérifier si l'utilisateur a acheté ce produit (pour isVerifiedPurchase)
      const hasOrdered = await this.prisma.order.findFirst({
        where: {
          userId,
          items: {
            some: {
              productId: createReviewDto.productId,
            },
          },
          status: {
            in: ['DELIVERED', 'PAID', 'SHIPPED'],
          },
        },
      });

      const review = await this.prisma.review.create({
        data: {
          rating: createReviewDto.rating,
          comment: createReviewDto.comment,
          userId,
          productId: createReviewDto.productId,
          isVerifiedPurchase: !!hasOrdered,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          product: true,
        },
      });

      // Mettre à jour la note moyenne du produit
      await this.updateProductRating(createReviewDto.productId);

      return review;
    }

    if (createReviewDto.serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: createReviewDto.serviceId },
        include: {
          provider: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!service) {
        throw new NotFoundException('Service introuvable');
      }

      // Vérifier si l'utilisateur a déjà laissé un avis pour ce service
      const existingReview = await this.prisma.review.findFirst({
        where: {
          userId,
          serviceId: createReviewDto.serviceId,
        },
      });

      if (existingReview) {
        throw new BadRequestException('Vous avez déjà laissé un avis pour ce service');
      }

      // Vérifier si l'utilisateur a réservé ce service (pour isVerifiedPurchase)
      const hasBooked = await this.prisma.booking.findFirst({
        where: {
          userId,
          serviceId: createReviewDto.serviceId,
          status: {
            in: ['CONFIRMED', 'COMPLETED'],
          },
        },
      });

      const review = await this.prisma.review.create({
        data: {
          rating: createReviewDto.rating,
          comment: createReviewDto.comment,
          userId,
          serviceId: createReviewDto.serviceId,
          isVerifiedPurchase: !!hasBooked,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          service: {
            include: {
              provider: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      // Mettre à jour la note moyenne du service
      await this.updateServiceRating(createReviewDto.serviceId);

      return review;
    }
  }

  async findAll(productId?: string, serviceId?: string, providerId?: string) {
    const where: any = {
      isPublished: true,
    };

    if (productId) {
      where.productId = productId;
    }

    if (serviceId) {
      where.serviceId = serviceId;
    }

    if (providerId) {
      // Pour un prestataire, récupérer les avis de ses services
      where.service = {
        providerId,
      };
    }

    return this.prisma.review.findMany({
      where,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        product: true,
        service: {
          include: {
            provider: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        product: true,
        service: {
          include: {
            provider: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Avis introuvable');
    }

    return review;
  }

  async update(id: string, userId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.findOne(id);

    // Seul l'auteur de l'avis ou un admin peut le modifier
    if (review.userId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cet avis');
    }

    return this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        product: true,
        service: true,
      },
    });
  }

  async delete(id: string, userId: string, userRole: string) {
    const review = await this.findOne(id);

    // Seul l'auteur de l'avis ou un admin peut le supprimer
    if (review.userId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer cet avis');
    }

    const deletedReview = await this.prisma.review.delete({
      where: { id },
    });

    // Mettre à jour les notes moyennes
    if (deletedReview.productId) {
      await this.updateProductRating(deletedReview.productId);
    }
    if (deletedReview.serviceId) {
      await this.updateServiceRating(deletedReview.serviceId);
    }

    return deletedReview;
  }

  async replyToReview(reviewId: string, providerId: string, replyDto: ReplyReviewDto) {
    const review = await this.findOne(reviewId);

    // Vérifier que l'avis est pour un service
    if (!review.serviceId) {
      throw new BadRequestException('Cet avis n\'est pas pour un service');
    }

    // Vérifier que le prestataire est bien le propriétaire du service
    const service = await this.prisma.service.findUnique({
      where: { id: review.serviceId },
    });

    if (!service || service.providerId !== providerId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à répondre à cet avis');
    }

    // Mettre à jour l'avis avec la réponse
    return this.prisma.review.update({
      where: { id: reviewId },
      data: {
        providerReply: replyDto.reply,
        providerReplyAt: new Date(),
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        service: {
          include: {
            provider: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  async markHelpful(reviewId: string, userId: string) {
    const review = await this.findOne(reviewId);

    // Vérifier si l'utilisateur a déjà marqué cet avis comme utile
    const existingHelpful = await this.prisma.reviewHelpful.findFirst({
      where: {
        reviewId,
        userId,
      },
    });

    if (existingHelpful) {
      // Retirer le vote
      await this.prisma.reviewHelpful.delete({
        where: { id: existingHelpful.id },
      });
      await this.prisma.review.update({
        where: { id: reviewId },
        data: {
          helpfulCount: {
            decrement: 1,
          },
        },
      });
      return { helpful: false };
    } else {
      // Ajouter le vote
      await this.prisma.reviewHelpful.create({
        data: {
          reviewId,
          userId,
        },
      });
      await this.prisma.review.update({
        where: { id: reviewId },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
      });
      return { helpful: true };
    }
  }

  private async updateProductRating(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        productId,
        isPublished: true,
      },
    });

    if (reviews.length === 0) {
      await this.prisma.product.update({
        where: { id: productId },
        data: {
          rating: null,
          averageRating: null,
          reviewCount: 0,
        },
      });
      return;
    }

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(averageRating * 10) / 10, // Arrondir à 1 décimale
        averageRating: Math.round(averageRating * 10) / 10, // Alias
        reviewCount: reviews.length,
      },
    });
  }

  private async updateServiceRating(serviceId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        serviceId,
        isPublished: true,
      },
    });

    if (reviews.length === 0) {
      await this.prisma.service.update({
        where: { id: serviceId },
        data: {
          rating: null,
          averageRating: null,
          reviewCount: 0,
        },
      });
      return;
    }

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await this.prisma.service.update({
      where: { id: serviceId },
      data: {
        rating: Math.round(averageRating * 10) / 10, // Arrondir à 1 décimale
        averageRating: Math.round(averageRating * 10) / 10, // Alias
        reviewCount: reviews.length,
      },
    });
  }

  // Pour admin : récupérer tous les avis (publiés et non publiés)
  async findAllForAdmin() {
    return this.prisma.review.findMany({
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        product: true,
        service: {
          include: {
            provider: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

