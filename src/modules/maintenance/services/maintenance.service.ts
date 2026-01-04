import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { UpdateMaintenanceSettingsDto } from '../dto/update-maintenance-settings.dto';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.maintenanceSettings.findFirst();

    // Si aucun paramètre n'existe, créer des paramètres par défaut
    if (!settings) {
      settings = await this.prisma.maintenanceSettings.create({
        data: {
          isBookingDisabled: false,
          isChatDisabled: false,
          isPrestatairesDisabled: false,
          isAuthDisabled: false,
        },
      });
    }

    return settings;
  }

  async updateSettings(
    dto: UpdateMaintenanceSettingsDto,
    updatedBy?: string,
  ) {
    let settings = await this.prisma.maintenanceSettings.findFirst();

    if (!settings) {
      // Créer les paramètres s'ils n'existent pas
      settings = await this.prisma.maintenanceSettings.create({
        data: {
          ...dto,
          updatedBy,
        },
      });
    } else {
      // Mettre à jour les paramètres existants
      settings = await this.prisma.maintenanceSettings.update({
        where: { id: settings.id },
        data: {
          ...dto,
          updatedBy,
        },
      });
    }

    return settings;
  }

  async isBookingDisabled(): Promise<{ disabled: boolean; message?: string }> {
    const settings = await this.getSettings();
    return {
      disabled: settings.isBookingDisabled,
      message: settings.bookingMessage || undefined,
    };
  }

  async isChatDisabled(): Promise<{ disabled: boolean; message?: string }> {
    const settings = await this.getSettings();
    return {
      disabled: settings.isChatDisabled,
      message: settings.chatMessage || undefined,
    };
  }

  async isPrestatairesDisabled(): Promise<{ disabled: boolean; message?: string }> {
    const settings = await this.getSettings();
    return {
      disabled: settings.isPrestatairesDisabled,
      message: settings.prestatairesMessage || undefined,
    };
  }

  async isAuthDisabled(): Promise<{ disabled: boolean; message?: string }> {
    const settings = await this.getSettings();
    return {
      disabled: settings.isAuthDisabled,
      message: settings.authMessage || undefined,
    };
  }
}

