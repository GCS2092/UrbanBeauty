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
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: any, @Query('all') all?: string, @Query('seller') seller?: string) {
    // Si admin et paramètre 'all', retourner toutes les commandes
    if (user.role === 'ADMIN' && all === 'true') {
      return this.ordersService.findAll();
    }
    // Si vendeuse et paramètre 'seller', retourner les commandes contenant ses produits
    if (user.role === 'VENDEUSE' && seller === 'true') {
      return this.ordersService.findBySeller(user.userId);
    }
    // Sinon, retourner uniquement les commandes de l'utilisateur
    return this.ordersService.findAll(user.userId);
  }

  @Get('track/:trackingCode')
  async findByTrackingCode(@Param('trackingCode') trackingCode: string) {
    // Endpoint public pour rechercher une commande par code de suivi
    return this.ordersService.findByTrackingCode(trackingCode);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const order = await this.ordersService.findOne(id);
    
    // Vérifier que l'utilisateur peut accéder à cette commande
    if (user.role === 'ADMIN') {
      // Admin peut voir toutes les commandes
      return order;
    } else if (user.role === 'VENDEUSE') {
      // Vendeuse peut voir les commandes contenant ses produits
      const hasSellerProduct = order.items.some(item => item.product.sellerId === user.userId);
      if (!hasSellerProduct) {
        throw new ForbiddenException('Vous n\'êtes pas autorisé à accéder à cette commande');
      }
      return order;
    } else if (order.userId !== user.userId) {
      // Client peut voir uniquement ses propres commandes
      throw new ForbiddenException('Vous n\'êtes pas autorisé à accéder à cette commande');
    }
    
    return order;
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: any) {
    // Passer le userId si l'utilisateur est connecté
    // Sinon userId sera null pour les commandes guest
    return this.ordersService.create(createOrderDto, user?.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'VENDEUSE')
  async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto, @CurrentUser() user: any) {
    const order = await this.ordersService.findOne(id);
    
    // Vérifier les permissions
    if (user.role === 'VENDEUSE') {
      // Vendeuse peut seulement modifier les commandes contenant ses produits
      const hasSellerProduct = order.items.some(item => item.product.sellerId === user.userId);
      if (!hasSellerProduct) {
        throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette commande');
      }
    }
    
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  @Delete('seller/clear-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDEUSE', 'COIFFEUSE')
  async clearSellerHistory(@CurrentUser() user: any) {
    // Permet aux vendeurs de vider leur historique de commandes terminées/annulées
    return this.ordersService.clearSellerHistory(user.userId);
  }

  @Patch(':id/seller-notes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VENDEUSE', 'ADMIN')
  async updateSellerNotes(
    @Param('id') id: string,
    @Body() body: { sellerNotes: string },
    @CurrentUser() user: any,
  ) {
    return this.ordersService.updateSellerNotes(id, user.userId, body.sellerNotes);
  }
}

