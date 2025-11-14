import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

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

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        sellerId: userId,
      },
      include: {
        category: true,
        images: true,
      },
    });
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    const product = await this.findOne(id);

    // Vérifier que l'utilisateur est le vendeur
    if (product.sellerId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier ce produit');
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
        images: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const product = await this.findOne(id);

    // Vérifier que l'utilisateur est le vendeur
    if (product.sellerId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer ce produit');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return { message: 'Produit supprimé avec succès' };
  }
}

