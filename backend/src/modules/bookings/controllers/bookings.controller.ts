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
  BadRequestException,
} from '@nestjs/common';
import { BookingsService } from '../services/bookings.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: any, @Query('provider') provider?: string) {
    // Si provider=true, retourner les réservations pour les services du prestataire
    if (provider === 'true' && user.role === 'COIFFEUSE') {
      // Trouver le profil du prestataire
      return this.bookingsService.findAll(undefined, user.profileId);
    }
    // Sinon, retourner les réservations de l'utilisateur
    return this.bookingsService.findAll(user.userId);
  }

  @Get('availability/:serviceId')
  getAvailability(@Param('serviceId') serviceId: string, @Query('date') date: string) {
    if (!date) {
      throw new BadRequestException('La date est requise');
    }
    return this.bookingsService.getAvailableSlots(serviceId, date);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @CurrentUser() user?: any) {
    // Permettre les réservations sans authentification (guest bookings)
    const userId = user?.userId;
    return this.bookingsService.create(createBookingDto, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser() user: any,
  ) {
    return this.bookingsService.update(id, updateBookingDto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bookingsService.remove(id, user.userId);
  }
}

