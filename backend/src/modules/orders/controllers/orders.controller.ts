import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: any, @Query('all') all?: string) {
    // Si admin et paramètre 'all', retourner toutes les commandes
    if (user.role === 'ADMIN' && all === 'true') {
      return this.ordersService.findAll();
    }
    // Sinon, retourner uniquement les commandes de l'utilisateur
    return this.ordersService.findAll(user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const order = await this.ordersService.findOne(id);
    
    // Vérifier que l'utilisateur peut accéder à cette commande
    if (user.role !== 'ADMIN' && order.userId !== user.userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à accéder à cette commande');
    }
    
    return order;
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    // Pas de guard pour permettre les commandes guest
    // userId sera null pour les commandes guest
    return this.ordersService.create(createOrderDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}

