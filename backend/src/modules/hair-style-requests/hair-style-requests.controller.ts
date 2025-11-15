import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { HairStyleRequestsService } from './hair-style-requests.service';
import { CreateHairStyleRequestDto } from './dto/create-hair-style-request.dto';
import { UpdateHairStyleRequestDto } from './dto/update-hair-style-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { PrismaService } from '../../prisma.service';

@Controller('hair-style-requests')
export class HairStyleRequestsController {
  constructor(
    private readonly hairStyleRequestsService: HairStyleRequestsService,
    private readonly prisma: PrismaService,
  ) {}

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
  async findAll(@Query('providerId') providerId?: string, @CurrentUser() user?: any) {
    // Si c'est un prestataire, récupérer son profileId
    let providerIdToUse = providerId;
    if (user?.role === 'COIFFEUSE') {
      const profile = await this.prisma.profile.findUnique({
        where: { userId: user.userId },
      });
      providerIdToUse = profile?.id;
    }
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
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateHairStyleRequestDto,
    @CurrentUser() user: any,
  ) {
    let providerId: string | undefined;
    if (user.role === 'COIFFEUSE') {
      const profile = await this.prisma.profile.findUnique({
        where: { userId: user.userId },
      });
      providerId = profile?.id;
    }
    return this.hairStyleRequestsService.update(id, providerId || '', updateDto);
  }
}

