import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { Request, Response } from 'express';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ApiResponse } from 'src/common/response/api-response';
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

  @ApiOperation({ summary: 'User login' })
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(dto.email, dto.password);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json(
      ApiResponse.success('User logged in successfully', {
        token: result.accessToken,
      }),
    );
  }

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

  // refresh token handling
  // @Post('refresh-token')
  // refreshToken(@Body() dto: RefreshTokenDto) {
  //   return this.authService.refreshToken(dto.refreshToken);
  // }

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

  // refresh token route
  @ApiOperation({ summary: 'Refresh token' })
  @Post('refresh-token')
  async refreshTokenHandler(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.refreshToken as string;
    const result = await this.authService.refreshTokenHandler(refreshToken);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json(
      ApiResponse.success('Token refreshed successfully', {
        token: result.accessToken,
      }),
    );
  }
}
