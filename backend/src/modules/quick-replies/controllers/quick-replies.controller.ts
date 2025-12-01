import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { QuickRepliesService } from '../services/quick-replies.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

class CreateQuickReplyDto {
  title: string;
  content: string;
  shortcut?: string;
}

class UpdateQuickReplyDto {
  title?: string;
  content?: string;
  shortcut?: string;
  order?: number;
}

class ReorderDto {
  orderedIds: string[];
}

@Controller('quick-replies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('COIFFEUSE', 'VENDEUSE', 'ADMIN')
export class QuickRepliesController {
  constructor(private readonly quickRepliesService: QuickRepliesService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.quickRepliesService.findAll(user.userId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.quickRepliesService.findOne(user.userId, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: any, @Body() dto: CreateQuickReplyDto) {
    return this.quickRepliesService.create(user.userId, dto);
  }

  @Post('defaults')
  @HttpCode(HttpStatus.CREATED)
  createDefaults(@CurrentUser() user: any) {
    return this.quickRepliesService.createDefaults(user.userId);
  }

  @Patch('reorder')
  reorder(@CurrentUser() user: any, @Body() dto: ReorderDto) {
    return this.quickRepliesService.reorder(user.userId, dto.orderedIds);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateQuickReplyDto,
  ) {
    return this.quickRepliesService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.quickRepliesService.remove(user.userId, id);
  }
}

