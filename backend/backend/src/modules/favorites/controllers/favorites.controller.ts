import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FavoritesService } from '../services/favorites.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  getUserFavorites(@CurrentUser() user: any) {
    return this.favoritesService.getUserFavorites(user.userId);
  }

  @Get('count')
  getFavoritesCount(@CurrentUser() user: any) {
    return this.favoritesService.getFavoritesCount(user.userId);
  }

  @Get('check/product/:productId')
  async isProductFavorite(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    const isFavorite = await this.favoritesService.isProductFavorite(
      user.userId,
      productId,
    );
    return { isFavorite };
  }

  @Get('check/service/:serviceId')
  async isServiceFavorite(
    @CurrentUser() user: any,
    @Param('serviceId') serviceId: string,
  ) {
    const isFavorite = await this.favoritesService.isServiceFavorite(
      user.userId,
      serviceId,
    );
    return { isFavorite };
  }

  @Post('product/:productId')
  @HttpCode(HttpStatus.CREATED)
  addProductToFavorites(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    return this.favoritesService.addProductToFavorites(user.userId, productId);
  }

  @Post('service/:serviceId')
  @HttpCode(HttpStatus.CREATED)
  addServiceToFavorites(
    @CurrentUser() user: any,
    @Param('serviceId') serviceId: string,
  ) {
    return this.favoritesService.addServiceToFavorites(user.userId, serviceId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  removeFromFavorites(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.favoritesService.removeFromFavorites(user.userId, id);
  }

  @Delete('product/:productId')
  @HttpCode(HttpStatus.OK)
  removeProductFromFavorites(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    return this.favoritesService.removeProductFromFavorites(user.userId, productId);
  }

  @Delete('service/:serviceId')
  @HttpCode(HttpStatus.OK)
  removeServiceFromFavorites(
    @CurrentUser() user: any,
    @Param('serviceId') serviceId: string,
  ) {
    return this.favoritesService.removeServiceFromFavorites(user.userId, serviceId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  clearAllFavorites(@CurrentUser() user: any) {
    return this.favoritesService.clearAllFavorites(user.userId);
  }
}

