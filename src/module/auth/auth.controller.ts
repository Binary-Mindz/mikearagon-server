import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ClientRegisterDto } from './dto/client-register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/client')
  registerClient(@Body() dto: ClientRegisterDto) {
    return this.authService.registerClient(dto);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
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
