import { Module } from '@nestjs/common';
import { CouponsService } from './services/coupons.service';
import { CouponsController } from './controllers/coupons.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [CouponsController],
  providers: [CouponsService, PrismaService],
  exports: [CouponsService],
})
export class CouponsModule {}

