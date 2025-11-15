import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { HairStyleRequestsService } from './hair-style-requests.service';
import { CreateHairStyleRequestDto } from './dto/create-hair-style-request.dto';
import { UpdateHairStyleRequestDto } from './dto/update-hair-style-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@Controller('hair-style-requests')
export class HairStyleRequestsController {
  constructor(private readonly hairStyleRequestsService: HairStyleRequestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createHairStyleRequestDto: CreateHairStyleRequestDto,
    @CurrentUser() user?: any,
  ) {
    return this.hairStyleRequestsService.create(createHairStyleRequestDto, user?.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COIFFEUSE', 'ADMIN')
  findAll(@Query('providerId') providerId?: string, @CurrentUser() user?: any) {
    // Si c'est un prestataire, utiliser son profileId
    const providerIdToUse = user?.role === 'COIFFEUSE' ? user.profileId : providerId;
    return this.hairStyleRequestsService.findAll(providerIdToUse);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAllForAdmin() {
    return this.hairStyleRequestsService.findAllForAdmin();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.hairStyleRequestsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COIFFEUSE', 'ADMIN')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateHairStyleRequestDto,
    @CurrentUser() user: any,
  ) {
    const providerId = user.role === 'COIFFEUSE' ? user.profileId : undefined;
    return this.hairStyleRequestsService.update(id, providerId, updateDto);
  }
}

