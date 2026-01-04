import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ShippingAddressesService } from '../services/shipping-addresses.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

class CreateShippingAddressDto {
  label: string;
  fullName: string;
  phone?: string;
  address: string;
  city: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

class UpdateShippingAddressDto {
  label?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

@Controller('shipping-addresses')
@UseGuards(JwtAuthGuard)
export class ShippingAddressesController {
  constructor(private readonly shippingAddressesService: ShippingAddressesService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.shippingAddressesService.findAll(user.userId);
  }

  @Get('default')
  getDefault(@CurrentUser() user: any) {
    return this.shippingAddressesService.getDefault(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.shippingAddressesService.findOne(user.userId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: any, @Body() dto: CreateShippingAddressDto) {
    return this.shippingAddressesService.create(user.userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateShippingAddressDto,
  ) {
    return this.shippingAddressesService.update(user.userId, id, dto);
  }

  @Patch(':id/set-default')
  setDefault(@CurrentUser() user: any, @Param('id') id: string) {
    return this.shippingAddressesService.setDefault(user.userId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.shippingAddressesService.remove(user.userId, id);
  }
}

