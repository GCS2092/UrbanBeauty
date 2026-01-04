import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

interface CreateShippingAddressDto {
  label: string;
  fullName: string;
  phone?: string;
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

interface UpdateShippingAddressDto {
  label?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

@Injectable()
export class ShippingAddressesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.shippingAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const address = await this.prisma.shippingAddress.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException('Adresse introuvable');
    }

    if (address.userId !== userId) {
      throw new NotFoundException('Adresse introuvable');
    }

    return address;
  }

  async create(userId: string, dto: CreateShippingAddressDto) {
    // Limite à 10 adresses par utilisateur
    const count = await this.prisma.shippingAddress.count({
      where: { userId },
    });

    if (count >= 10) {
      throw new BadRequestException('Vous avez atteint la limite de 10 adresses');
    }

    // Si c'est la première adresse ou isDefault est true, la définir comme défaut
    const isFirstAddress = count === 0;
    const shouldBeDefault = isFirstAddress || dto.isDefault;

    // Si cette adresse doit être par défaut, retirer le défaut des autres
    if (shouldBeDefault) {
      await this.prisma.shippingAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.shippingAddress.create({
      data: {
        userId,
        label: dto.label,
        fullName: dto.fullName,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        postalCode: dto.postalCode,
        country: dto.country || 'Cameroun',
        isDefault: shouldBeDefault,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateShippingAddressDto) {
    await this.findOne(userId, id);

    // Si on définit cette adresse comme défaut, retirer le défaut des autres
    if (dto.isDefault) {
      await this.prisma.shippingAddress.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.shippingAddress.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    const address = await this.findOne(userId, id);

    await this.prisma.shippingAddress.delete({
      where: { id },
    });

    // Si l'adresse supprimée était la défaut, définir une autre comme défaut
    if (address.isDefault) {
      const nextAddress = await this.prisma.shippingAddress.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (nextAddress) {
        await this.prisma.shippingAddress.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return { message: 'Adresse supprimée' };
  }

  async setDefault(userId: string, id: string) {
    await this.findOne(userId, id);

    // Retirer le défaut des autres adresses
    await this.prisma.shippingAddress.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Définir cette adresse comme défaut
    return this.prisma.shippingAddress.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  async getDefault(userId: string) {
    return this.prisma.shippingAddress.findFirst({
      where: { userId, isDefault: true },
    });
  }
}

