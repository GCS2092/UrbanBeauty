import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateHairStyleRequestDto } from './dto/create-hair-style-request.dto';
import { UpdateHairStyleRequestDto } from './dto/update-hair-style-request.dto';

@Injectable()
export class HairStyleRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createHairStyleRequestDto: CreateHairStyleRequestDto, userId?: string) {
    return this.prisma.hairStyleRequest.create({
      data: {
        lookbookItemId: createHairStyleRequestDto.lookbookItemId,
        lookbookItemName: createHairStyleRequestDto.lookbookItemName,
        clientName: createHairStyleRequestDto.clientName,
        clientPhone: createHairStyleRequestDto.clientPhone,
        clientEmail: createHairStyleRequestDto.clientEmail,
        hairStyleType: createHairStyleRequestDto.hairStyleType,
        numberOfBraids: createHairStyleRequestDto.numberOfBraids,
        braidType: createHairStyleRequestDto.braidType,
        numberOfPackages: createHairStyleRequestDto.numberOfPackages,
        preferredTime: createHairStyleRequestDto.preferredTime
          ? new Date(createHairStyleRequestDto.preferredTime)
          : null,
        preferredDate: createHairStyleRequestDto.preferredDate
          ? new Date(createHairStyleRequestDto.preferredDate)
          : null,
        additionalDetails: createHairStyleRequestDto.additionalDetails,
        userId: userId,
      },
    });
  }

  async findAll(providerId?: string) {
    const where: any = {};
    
    // Si un providerId est fourni, récupérer seulement les demandes acceptées par ce prestataire
    // Sinon, récupérer toutes les demandes en attente (pour que les prestataires puissent les voir)
    if (providerId) {
      where.providerId = providerId;
    }

    return this.prisma.hairStyleRequest.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const request = await this.prisma.hairStyleRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Demande introuvable');
    }

    return request;
  }

  async update(id: string, providerId: string, updateDto: UpdateHairStyleRequestDto) {
    const request = await this.findOne(id);

    // Si la demande est acceptée, assigner le prestataire
    if (updateDto.status === 'CONFIRMED') {
      return this.prisma.hairStyleRequest.update({
        where: { id },
        data: {
          status: updateDto.status,
          providerId: providerId,
        },
      });
    }

    return this.prisma.hairStyleRequest.update({
      where: { id },
      data: {
        status: updateDto.status,
      },
    });
  }

  // Pour admin : récupérer toutes les demandes
  async findAllForAdmin() {
    return this.prisma.hairStyleRequest.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

