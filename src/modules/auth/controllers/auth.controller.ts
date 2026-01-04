import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Put, ServiceUnavailableException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { MaintenanceService } from '../../maintenance/services/maintenance.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly maintenanceService: MaintenanceService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Vérifier si l'authentification est désactivée
    const authStatus = await this.maintenanceService.isAuthDisabled();
    if (authStatus.disabled) {
      throw new ServiceUnavailableException(
        authStatus.message || 'L\'inscription est temporairement désactivée',
      );
    }
    
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    // Vérifier si l'authentification est désactivée
    const authStatus = await this.maintenanceService.isAuthDisabled();
    if (authStatus.disabled) {
      throw new ServiceUnavailableException(
        authStatus.message || 'La connexion est temporairement désactivée',
      );
    }
    
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.authService.validateUser(user.userId);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.userId, changePasswordDto.newPassword);
  }
}

