import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from '../services/services.service';
import { CreateServiceDto } from '../dto/create-service.dto';
import { UpdateServiceDto } from '../dto/update-service.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(@CurrentUser() user?: any) {
    // Si l'utilisateur est connecté et est une coiffeuse, retourner seulement ses services
    if (user?.role === 'COIFFEUSE' && user?.userId) {
      return this.servicesService.findByProvider(user.userId);
    }
    return this.servicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.servicesService.findOne(id, user?.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COIFFEUSE')
  create(@Body() createServiceDto: CreateServiceDto, @CurrentUser() user: any) {
    return this.servicesService.create(createServiceDto, user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @CurrentUser() user: any,
  ) {
    // Admin peut modifier n'importe quel service, sinon seulement les siens
    return this.servicesService.update(id, updateServiceDto, user.role === 'ADMIN' ? undefined : user.userId, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    // Admin peut supprimer n'importe quel service, sinon seulement les siens
    return this.servicesService.remove(id, user.role === 'ADMIN' ? undefined : user.userId, user.role);
  }
}

