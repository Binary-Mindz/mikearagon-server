import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ClientRegisterDto } from './dto/client-register.dto';
import { DriverRegisterDto } from './dto/driver-register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyTokenTypeDto } from './dto/verify-token-type.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Client registration' })
  @Post('register/client')
  registerClient(@Body() dto: ClientRegisterDto) {
    return this.authService.registerClient(dto);
  }

  @ApiOperation({ summary: 'Driver registration for Admin' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('register/driver')
  registerDriver(@Body() dto: DriverRegisterDto) {
    return this.authService.registerDriver(dto);
  }

  @ApiOperation({
    summary: 'Email verification and otp verification',
    description:
      'Token types - "token" for email verification and "otp" for otp verification',
  })
  @Post('verify-email/:token')
  @ApiParam({ name: 'token' })
  verifyEmail(@Param('token') token: string, @Body() dto: VerifyTokenTypeDto) {
    return this.authService.verifyEmail(token, dto.type);
  }

  @ApiOperation({ summary: 'User login' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // Change password
  @ApiOperation({ summary: 'Change password' })
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Body() dto: ChangePasswordDto,
    @GetUser('sub') userId: string,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  @ApiOperation({ summary: 'Forgot password' })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @ApiOperation({ summary: 'Reset password after otp' })
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
