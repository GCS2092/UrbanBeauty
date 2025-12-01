import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/create-user.dto';

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

  async create(createUserDto: CreateUserDto) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Si aucun mot de passe n'est fourni, utiliser "password" par défaut
    const passwordToUse = createUserDto.password || 'password';
    const mustChangePassword = !createUserDto.password; // Si pas de mot de passe fourni, l'utilisateur devra le changer

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(passwordToUse, 10);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        role: createUserDto.role,
        isActive: true,
        mustChangePassword: mustChangePassword,
      },
      include: {
        profile: true,
      },
    });

    // Créer le profil si firstName ou lastName sont fournis
    if (createUserDto.firstName || createUserDto.lastName) {
      await this.prisma.profile.create({
        data: {
          userId: user.id,
          firstName: createUserDto.firstName || 'Utilisateur',
          lastName: createUserDto.lastName || '',
          phone: createUserDto.phone,
        },
      });

      // Recharger l'utilisateur avec le profil
      return this.findOne(user.id);
    }

    return user;
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    // Supprimer le profil s'il existe
    if (user.profile) {
      await this.prisma.profile.delete({
        where: { userId: id },
      });
    }

    // Supprimer l'utilisateur
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, isActive: boolean, blockReason?: string) {
    const user = await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { 
        isActive,
        blockReason: isActive ? null : (blockReason || null), // Effacer le message si débloqué
      },
      include: {
        profile: true,
      },
    });
  }
}

