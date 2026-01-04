import { Module } from '@nestjs/common';
import { BookingsService } from './services/bookings.service';
import { BookingsController } from './controllers/bookings.controller';
import { PrismaService } from '../../prisma.service';
import { MaintenanceModule } from '../maintenance/maintenance.module';

@Module({
  imports: [MaintenanceModule],
  controllers: [BookingsController],
  providers: [BookingsService, PrismaService],
  exports: [BookingsService],
})
export class BookingsModule {}

