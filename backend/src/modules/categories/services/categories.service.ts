import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';

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
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(providerId?: string) {
    return this.prisma.category.findMany({
      where: {
        // Si providerId est fourni, retourner seulement les catégories de ce prestataire
        // Sinon, retourner toutes les catégories (pour admin/public)
        ...(providerId ? { providerId } : {}),
      },
      include: {
        parent: true,
        children: true,
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Catégorie introuvable');
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto, providerId?: string) {
    // Générer un slug unique en incluant le providerId si présent
    const baseSlug = generateSlug(createCategoryDto.name);
    const slug = providerId ? `${baseSlug}-${providerId.slice(0, 8)}` : baseSlug;
    
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        slug,
        providerId: providerId || null, // null pour les catégories globales (admin)
        isActive: createCategoryDto.isActive ?? true,
      },
      include: {
        parent: true,
        children: true,
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, providerId?: string) {
    const category = await this.findOne(id);

    // Vérifier que la catégorie appartient au prestataire (sauf admin)
    if (providerId && category.providerId !== providerId) {
      throw new Error('Vous n\'avez pas le droit de modifier cette catégorie');
    }

    const updateData: any = { ...updateCategoryDto };
    
    // Si le nom change, régénérer le slug
    if ('name' in updateCategoryDto && updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const baseSlug = generateSlug(updateCategoryDto.name);
      updateData.slug = category.providerId ? `${baseSlug}-${category.providerId.slice(0, 8)}` : baseSlug;
    }

    return this.prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: true,
        children: true,
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async remove(id: string, providerId?: string) {
    const category = await this.findOne(id);

    // Vérifier que la catégorie appartient au prestataire (sauf admin)
    if (providerId && category.providerId !== providerId) {
      throw new Error('Vous n\'avez pas le droit de supprimer cette catégorie');
    }

    // Vérifier s'il y a des produits ou services associés
    const productsCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    const servicesCount = await this.prisma.service.count({
      where: { category: category.name },
    });

    if (productsCount > 0 || servicesCount > 0) {
      throw new Error('Impossible de supprimer une catégorie qui contient des produits ou services');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}

