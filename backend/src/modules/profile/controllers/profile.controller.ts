import { Controller, Get, Patch, Body, UseGuards, Param } from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return this.profileService.findOne(user.userId);
  }

  @Get('provider/:id')
  getProviderProfile(@Param('id') id: string) {
    return this.profileService.findByProviderId(id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  updateProfile(@CurrentUser() user: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(user.userId, updateProfileDto);
  }
}

