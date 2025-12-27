import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MaintenanceService } from '../services/maintenance.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { UpdateMaintenanceSettingsDto } from '../dto/update-maintenance-settings.dto';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getSettings() {
    return this.maintenanceService.getSettings();
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  updateSettings(
    @Body() dto: UpdateMaintenanceSettingsDto,
    @CurrentUser() user: any,
  ) {
    return this.maintenanceService.updateSettings(dto, user.userId);
  }

  // Endpoints publics pour vérifier l'état des fonctionnalités
  @Get('check/booking')
  async checkBooking() {
    return this.maintenanceService.isBookingDisabled();
  }

  @Get('check/chat')
  async checkChat() {
    return this.maintenanceService.isChatDisabled();
  }

  @Get('check/prestataires')
  async checkPrestataires() {
    return this.maintenanceService.isPrestatairesDisabled();
  }

  @Get('check/auth')
  async checkAuth() {
    return this.maintenanceService.isAuthDisabled();
  }
}

