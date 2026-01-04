import { Module } from '@nestjs/common';
import { ShippingAddressesService } from './services/shipping-addresses.service';
import { ShippingAddressesController } from './controllers/shipping-addresses.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [ShippingAddressesController],
  providers: [ShippingAddressesService, PrismaService],
  exports: [ShippingAddressesService],
})
export class ShippingAddressesModule {}

