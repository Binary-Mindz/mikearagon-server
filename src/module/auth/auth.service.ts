import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { ClientRegisterDto } from './dto/client-register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.accessSecret'),
      expiresIn: this.configService.get('jwt.accessExpiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    return { accessToken, refreshToken };
  }

  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const tokens = this.generateTokens(user.id, user.email, user.role);
    return tokens;
  }

  async registerClient(dto: ClientRegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists, please login!');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: 'CLIENT',
        fullName: dto.fullName,
        phone: dto.phone,
      },
    });

    await this.prisma.client.create({
      data: {
        userId: user.id,
        city: dto.city,
        companyName: dto.companyName,
        companyAddress: dto.companyAddress,
        suiteNumber: dto.suiteNumber,
        state: dto.state,
        zip: dto.zip,
        industry: dto.industry,
      },
    });

    const token = this.generateVerificationToken();
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    await this.prisma.verificationToken.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    // await this.emailService.sendVerificationEmail(user.email, token);

    return { message: 'Verification email sent successfully' };
  }

  async verifyEmail(token: string) {
    token = crypto.createHash('sha256').update(token).digest('hex');
    const record = await this.prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record) {
      throw new BadRequestException('Invalid token');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Token expired');
    }

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { isVerified: true },
    });

    await this.prisma.verificationToken.delete({
      where: { id: record.id },
    });

    return { message: 'Email verified successfully' };
  }

  // async refreshToken(refreshToken: string) {
  //   try {
  //     const payload = this.jwtService.verify(refreshToken, {
  //       secret: this.configService.get('jwt.refreshSecret'),
  //     });

  //     const user = await this.prisma.user.findUnique({
  //       where: { id: payload.sub },
  //     });

  //     if (!user || !user.refreshToken) {
  //       throw new UnauthorizedException();
  //     }

  //     const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);

  //     if (!isMatch) {
  //       throw new UnauthorizedException();
  //     }

  //     const tokens = this.generateTokens(user.id, user.email);

  //     const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

  //     await this.prisma.user.update({
  //       where: { id: user.id },
  //       data: { refreshToken: hashedRefreshToken },
  //     });

  //     return tokens;
  //   } catch {
  //     throw new UnauthorizedException('Invalid refresh token');
  //   }
  // }

  // async logout(userId: string) {
  //   await this.prisma.user.update({
  //     where: { id: userId },
  //     data: { refreshToken: null },
  //   });

  //   return { message: 'Logged out successfully' };
  // }
}
