import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import {
  supabaseSignIn,
  supabaseSignUp,
  supabaseAdminGetUser,
  supabaseAdminUpdateUser,
  getSupabaseRoleFromUser,
} from '../../../utils/supabase-admin';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName, phone, role } = registerDto;

    try {
      const authData = await supabaseSignUp(email, password, {
        role: role || 'CLIENT',
        first_name: firstName,
        last_name: lastName,
      });

      const userId = authData?.user?.id;
      if (!userId) {
        throw new ConflictException("Impossible de créer l'utilisateur");
      }

      // Le profil est créé par trigger côté DB. On met à jour les champs si besoin.
      await this.prisma.profiles.upsert({
        where: { userId },
        update: {
          firstName,
          lastName,
          phone,
        },
        create: {
          userId,
          firstName,
          lastName,
          phone,
        },
      });

      const access_token =
        authData?.access_token || authData?.session?.access_token || '';

      return {
        access_token,
        user: {
          id: userId,
          email,
          role: role || 'CLIENT',
          profile: {
            firstName,
            lastName,
          },
        },
      };
    } catch (err: any) {
      const message = err?.message || 'Erreur lors de la création du compte';
      if (
        message.includes('already registered') ||
        message.includes('already')
      ) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
      throw err;
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const authData = await supabaseSignIn(email, password);

    if (!authData?.access_token || !authData?.user?.id) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const userId = authData.user.id;
    const profile = await this.prisma.profiles.findUnique({
      where: { userId },
    });

    const role = getSupabaseRoleFromUser(authData.user);
    const access_token =
      authData?.access_token || authData?.session?.access_token || '';

    return {
      access_token,
      mustChangePassword: false,
      user: {
        id: userId,
        email,
        role,
        profile: profile
          ? {
              firstName: profile.firstName,
              lastName: profile.lastName,
              avatar: profile.avatar || undefined,
            }
          : undefined,
      },
    };
  }

  async validateUser(userId: string) {
    try {
      const user = await supabaseAdminGetUser(userId);
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        role: getSupabaseRoleFromUser(user),
      };
    } catch {
      return null;
    }
  }

  async changePassword(userId: string, newPassword: string) {
    await supabaseAdminUpdateUser(userId, { password: newPassword });
    return this.validateUser(userId);
  }
}
