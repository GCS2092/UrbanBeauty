import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: string) {
    const where: any = {};
    
    if (role && Object.values(Role).includes(role as Role)) {
      where.role = role as Role;
    }

    return this.prisma.user.findMany({
      where,
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }

  async updateRole(id: string, role: Role) {
    const user = await this.findOne(id);

    if (!Object.values(Role).includes(role)) {
      throw new BadRequestException('Rôle invalide');
    }

    return this.prisma.user.update({
      where: { id },
      data: { role },
      include: {
        profile: true,
      },
    });
  }
}

