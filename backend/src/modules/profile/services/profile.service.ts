import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profil introuvable');
    }

    return profile;
  }

  async update(userId: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.findOne(userId);

    return this.prisma.profile.update({
      where: { userId },
      data: updateProfileDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }
}

