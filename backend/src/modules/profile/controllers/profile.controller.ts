import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ProfileService } from '../services/profile.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@CurrentUser() user: any) {
    return this.profileService.findOne(user.userId);
  }

  @Patch()
  updateProfile(@CurrentUser() user: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(user.userId, updateProfileDto);
  }
}

