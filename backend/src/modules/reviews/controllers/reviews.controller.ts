import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReviewsService } from '../services/reviews.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { ReplyReviewDto } from '../dto/reply-review.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: any, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(user.userId, createReviewDto);
  }

  @Get()
  findAll(
    @Query('productId') productId?: string,
    @Query('serviceId') serviceId?: string,
    @Query('providerId') providerId?: string,
  ) {
    return this.reviewsService.findAll(productId, serviceId, providerId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAllForAdmin() {
    return this.reviewsService.findAllForAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, user.userId, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewsService.delete(id, user.userId, user.role);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('COIFFEUSE')
  @HttpCode(HttpStatus.OK)
  replyToReview(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() replyDto: ReplyReviewDto,
  ) {
    // Récupérer le profileId du prestataire
    return this.reviewsService.replyToReview(id, user.profileId, replyDto);
  }

  @Post(':id/helpful')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  markHelpful(@Param('id') id: string, @CurrentUser() user: any) {
    return this.reviewsService.markHelpful(id, user.userId);
  }
}

