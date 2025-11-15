import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateHairStyleRequestDto } from './dto/create-hair-style-request.dto';

@Injectable()
export class HairStyleRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createHairStyleRequestDto: CreateHairStyleRequestDto) {
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
      },
    });
  }
}

