import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ClientRegisterDto } from './dto/client-register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/client')
  registerClient(@Body() dto: ClientRegisterDto) {
    return this.authService.registerClient(dto);
  }

  @Post('verify-email/:token')
  @ApiParam({ name: 'token' })
  verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // @Post('refresh')
  // refresh(@Body() dto: RefreshTokenDto) {
  //   return this.authService.refreshToken(dto.refreshToken);
  // }

  // @Post('logout')
  // logout(@Body('userId') userId: string) {
  //   return this.authService.logout(userId);
  // }
}
