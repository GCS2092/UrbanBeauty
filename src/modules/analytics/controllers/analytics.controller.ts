import { Controller, Get, UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { AnalyticsService } from '../services/analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * GET /api/analytics/provider
   * Récupère les statistiques pour une coiffeuse
   */
  @Get('provider')
  async getProviderAnalytics(@CurrentUser() user: any) {
    if (user.role !== 'COIFFEUSE' && user.role !== 'MANICURISTE' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Accès réservé aux prestataires de services');
    }

    return this.analyticsService.getProviderAnalytics(user.userId);
  }

  /**
   * GET /api/analytics/seller
   * Récupère les statistiques pour une vendeuse
   */
  @Get('seller')
  async getSellerAnalytics(@CurrentUser() user: any) {
    if (user.role !== 'VENDEUSE' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Accès réservé aux vendeuses');
    }

    return this.analyticsService.getSellerAnalytics(user.userId);
  }

  /**
   * GET /api/analytics/me
   * Récupère les statistiques selon le rôle de l'utilisateur
   */
  @Get('me')
  async getMyAnalytics(@CurrentUser() user: any) {
    if (user.role === 'COIFFEUSE' || user.role === 'MANICURISTE') {
      return this.analyticsService.getProviderAnalytics(user.userId);
    }

    if (user.role === 'VENDEUSE') {
      return this.analyticsService.getSellerAnalytics(user.userId);
    }

    throw new ForbiddenException('Accès réservé aux professionnels');
  }
}

