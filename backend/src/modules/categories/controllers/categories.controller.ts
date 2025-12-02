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
} from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { PrismaService } from '../../../prisma.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(@CurrentUser() user?: any, @Query('providerId') providerId?: string) {
    // Si un providerId est fourni dans la query, l'utiliser
    // Sinon, si l'utilisateur est connecté et est un prestataire, utiliser son profileId
    let targetProviderId: string | undefined;
    
    if (providerId) {
      targetProviderId = providerId;
    } else if (user && (user.role === 'COIFFEUSE' || user.role === 'MANICURISTE')) {
      // Récupérer le profileId de l'utilisateur
      const profile = await this.prisma.profile.findUnique({
        where: { userId: user.userId },
        select: { id: true },
      });
      if (profile) {
        targetProviderId = profile.id;
      }
    }
    
    return this.categoriesService.findAll(targetProviderId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'COIFFEUSE', 'MANICURISTE')
  async create(@Body() createCategoryDto: CreateCategoryDto, @CurrentUser() user: any) {
    // Pour les admins, providerId sera null (catégorie globale)
    // Pour les prestataires, utiliser leur profileId
    let providerId: string | undefined;
    
    if (user.role === 'COIFFEUSE' || user.role === 'MANICURISTE') {
      const profile = await this.prisma.profile.findUnique({
        where: { userId: user.userId },
        select: { id: true },
      });
      if (profile) {
        providerId = profile.id;
      }
    }
    // Si admin, providerId reste undefined (null dans la DB)
    
    return this.categoriesService.create(createCategoryDto, providerId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'COIFFEUSE', 'MANICURISTE')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser() user: any,
  ) {
    // Pour les admins, providerId sera undefined (peuvent modifier toutes les catégories)
    // Pour les prestataires, utiliser leur profileId pour vérifier les permissions
    let providerId: string | undefined;
    
    if (user.role === 'COIFFEUSE' || user.role === 'MANICURISTE') {
      const profile = await this.prisma.profile.findUnique({
        where: { userId: user.userId },
        select: { id: true },
      });
      if (profile) {
        providerId = profile.id;
      }
    }
    
    return this.categoriesService.update(id, updateCategoryDto, providerId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'COIFFEUSE', 'MANICURISTE')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    // Pour les admins, providerId sera undefined (peuvent supprimer toutes les catégories)
    // Pour les prestataires, utiliser leur profileId pour vérifier les permissions
    let providerId: string | undefined;
    
    if (user.role === 'COIFFEUSE' || user.role === 'MANICURISTE') {
      const profile = await this.prisma.profile.findUnique({
        where: { userId: user.userId },
        select: { id: true },
      });
      if (profile) {
        providerId = profile.id;
      }
    }
    
    return this.categoriesService.remove(id, providerId);
  }
}

