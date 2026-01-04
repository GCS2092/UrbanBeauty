import { Module } from '@nestjs/common';
import { MaintenanceController } from './controllers/maintenance.controller';
import { MaintenanceService } from './services/maintenance.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [MaintenanceController],
  providers: [MaintenanceService, PrismaService],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}

