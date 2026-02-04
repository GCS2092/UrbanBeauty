import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { Role } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import {
  supabaseAdminDeleteUser,
  supabaseAdminGetUser,
  supabaseAdminListUsers,
  supabaseAdminUpdateUser,
  supabaseSignUp,
  getSupabaseRoleFromUser,
} from '../../../utils/supabase-admin';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: string) {
    const response = await supabaseAdminListUsers(1, 1000);
    const users = response?.users || [];

    const filtered = role
      ? users.filter((u: any) => getSupabaseRoleFromUser(u) === role)
      : users;

    const userIds = filtered.map((u: any) => u.id);
    const profiles = await this.prisma.profiles.findMany({
      where: { userId: { in: userIds } },
    });

    const profileByUser = new Map(profiles.map((p) => [p.userId, p]));

    return filtered.map((u: any) => ({
      id: u.id,
      email: u.email,
      role: getSupabaseRoleFromUser(u),
      profile: profileByUser.get(u.id) || null,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    }));
  }

  async findOne(id: string) {
    const user = await supabaseAdminGetUser(id);
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }
    const profile = await this.prisma.profiles.findUnique({
      where: { userId: id },
    });
    return {
      id: user.id,
      email: user.email,
      role: getSupabaseRoleFromUser(user),
      profile: profile || null,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async updateRole(id: string, role: Role) {
    if (!Object.values(Role).includes(role)) {
      throw new BadRequestException('Rôle invalide');
    }
    await supabaseAdminUpdateUser(id, {
      user_metadata: { role },
    });
    return this.findOne(id);
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName, phone, role } = createUserDto;

    try {
      const authData = await supabaseSignUp(email, password || 'password', {
        role: role || 'CLIENT',
        first_name: firstName,
        last_name: lastName,
      });

      const userId = authData?.user?.id;
      if (!userId) {
        throw new ConflictException('Impossible de créer l’utilisateur');
      }

      await this.prisma.profiles.upsert({
        where: { userId },
        update: { firstName: firstName || 'Utilisateur', lastName: lastName || '', phone },
        create: { userId, firstName: firstName || 'Utilisateur', lastName: lastName || '', phone },
      });

      return this.findOne(userId);
    } catch (err: any) {
      const message = err?.message || 'Erreur lors de la création';
      if (message.includes('already')) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.prisma.profiles.deleteMany({ where: { userId: id } });
    await supabaseAdminDeleteUser(id);
    return { success: true };
  }

  async updateStatus(id: string, isActive: boolean, blockReason?: string) {
    await supabaseAdminUpdateUser(id, {
      user_metadata: { blocked: !isActive, block_reason: blockReason || null },
    });
    return this.findOne(id);
  }

  async updateProfile(id: string, profileData: { firstName?: string; lastName?: string; phone?: string }) {
    await this.prisma.profiles.upsert({
      where: { userId: id },
      update: profileData,
      create: {
        userId: id,
        firstName: profileData.firstName || 'Utilisateur',
        lastName: profileData.lastName || '',
        phone: profileData.phone,
      },
    });
    return this.findOne(id);
  }
}
