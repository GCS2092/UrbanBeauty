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
  ServiceUnavailableException,
} from '@nestjs/common';
import { BookingsService } from '../services/bookings.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { UpdateBookingDto } from '../dto/update-booking.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { MaintenanceService } from '../../maintenance/services/maintenance.service';

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly maintenanceService: MaintenanceService,
  ) {}

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
  @UseGuards(OptionalJwtAuthGuard)
  async create(@Body() createBookingDto: CreateBookingDto, @CurrentUser() user?: any) {
    // Vérifier si les réservations sont désactivées
    const bookingStatus = await this.maintenanceService.isBookingDisabled();
    if (bookingStatus.disabled) {
      throw new ServiceUnavailableException(
        bookingStatus.message || 'La prise de rendez-vous est temporairement désactivée',
      );
    }
    
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

  @Delete('provider/clear-history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COIFFEUSE', 'MANICURISTE')
  clearProviderHistory(@CurrentUser() user: any) {
    return this.bookingsService.clearProviderHistory(user.profileId);
  }

  @Delete('provider/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COIFFEUSE', 'MANICURISTE')
  removeProviderBooking(@Param('id') id: string, @CurrentUser() user: any) {
    return this.bookingsService.removeProviderBooking(id, user.profileId);
  }
}

