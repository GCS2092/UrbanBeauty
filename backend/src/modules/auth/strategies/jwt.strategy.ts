import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import {
  getSupabaseRoleFromUser,
  supabaseAdminGetUser,
} from '../../../utils/supabase-admin';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('SUPABASE_JWT_SECRET') ||
        configService.get<string>('JWT_SECRET') ||
        'your-secret-key',
    });
  }

  async validate(payload: any) {
    try {
      const user = await supabaseAdminGetUser(payload.sub);
      return {
        userId: user.id,
        email: user.email,
        role: getSupabaseRoleFromUser(user),
      };
    } catch {
      if (!payload?.sub) {
        throw new UnauthorizedException();
      }
      return { userId: payload.sub, email: payload.email, role: payload.role };
    }
  }
}
