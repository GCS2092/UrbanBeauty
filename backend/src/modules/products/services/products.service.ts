import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

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
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        images: true,
        seller: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        seller: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }

    return product;
  }

  async create(createProductDto: CreateProductDto, userId: string) {
    // Vérifier que la catégorie existe
    const category = await this.prisma.category.findUnique({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Catégorie introuvable');
    }

    const { images, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        slug: generateSlug(createProductDto.name),
        sellerId: userId,
        images: images && images.length > 0 ? {
          create: images.map((img, index) => ({
            url: img.url,
            type: (img.type || 'URL') as 'URL' | 'UPLOADED',
            alt: img.alt || createProductDto.name,
            title: img.title || createProductDto.name,
            order: img.order ?? index,
            isPrimary: img.isPrimary ?? (index === 0),
          })),
        } : undefined,
      },
      include: {
        category: true,
        images: true,
      },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId?: string) {
    const product = await this.findOne(id);

    // Si userId est fourni, vérifier que l'utilisateur est le vendeur (sauf admin)
    if (userId && product.sellerId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce produit');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        ...(images && images.length > 0 ? {
          images: {
            create: images.map((img, index) => ({
              url: img.url,
              type: (img.type || 'URL') as 'URL' | 'UPLOADED',
              alt: img.alt || product.name,
              title: img.title || product.name,
              order: img.order ?? index,
              isPrimary: img.isPrimary ?? (index === 0),
            })),
          },
        } : {}),
      },
      include: {
        category: true,
        images: true,
      },
    });
  }

  async remove(id: string, userId?: string) {
    const product = await this.findOne(id);

    // Si userId est fourni, vérifier que l'utilisateur est le vendeur (sauf admin)
    if (userId && product.sellerId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce produit');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Produit supprimé avec succès' };
  }
}

