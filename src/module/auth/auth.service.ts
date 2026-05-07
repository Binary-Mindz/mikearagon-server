/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ApiResponse } from 'src/common/response/api-response';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ClientRegisterDto } from './dto/client-register.dto';
import { DriverRegisterDto } from './dto/driver-register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private emailService: MailService,
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

  generateRandomPassword(): string {
    const password = crypto.randomBytes(8).toString('hex');
    return password;
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

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return tokens;
  }

  async registerDriver(dto: DriverRegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Driver already exists with this email');
    }

    const plainPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: dto.email,
            password: hashedPassword,
            role: Role.DRIVER,
            fullName: dto.fullName,
            phone: dto.phone,
            profileImg: dto.profileImg || null,
          },
        });

        const driver = await tx.driver.create({
          data: {
            userId: user.id,
            city: dto.city,
            address: dto.address,
            state: dto.state,
            zip: dto.zip,
            status: dto.status,
          },
        });

        return { user, driver };
      });

      await this.emailService.sendDriverRegistrationEmail(
        dto.email,
        dto.fullName,
        dto.email,
        plainPassword,
      );

      return ApiResponse.success('Driver registered successfully', result.user);
    } catch (error) {
      console.log('Driver registration failed', error);
      throw new InternalServerErrorException(
        'Failed to register driver. Please try again.',
      );
    }
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
        role: Role.CLIENT,
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

    await this.emailService.sendVerificationEmail(
      user.email,
      token,
      user.fullName,
    );

    return { message: 'Verification email sent successfully' };
  }

  async verifyEmail(token: string, type: string) {
    if (type === 'token') {
      token = crypto.createHash('sha256').update(token).digest('hex');
    }
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

    if (type === 'token') {
      await this.prisma.user.update({
        where: { id: record.userId },
        data: { isVerified: true },
      });
    }

    await this.prisma.verificationToken.delete({
      where: { id: record.id },
    });

    if (type === 'token') {
      return ApiResponse.success('Email verified successfully');
    } else {
      const payload = { sub: record.userId, email: record.user.email };
      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get('jwt.accessSecret'),
        expiresIn: this.configService.get('jwt.accessExpiresIn'),
      });

      return ApiResponse.success('OTP verified successfully', {
        token: accessToken,
      });
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return ApiResponse.success('Password changed successfully');
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) throw new NotFoundException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.verificationToken.create({
      data: {
        token: otp,
        userId: user.id,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await this.emailService.sendForgotPasswordEmail(email, otp, user.fullName);
    return ApiResponse.success('Password reset code sent successfully');
  }

  async resetPassword(dto: ResetPasswordDto) {
    const payload = this.jwtService.verify(dto.token);

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new NotFoundException('User not found');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return ApiResponse.success('Password reset successfully');
  }

  async refreshTokenHandler(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    // 1. Verify token
    const decoded = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('jwt.refreshSecret'),
    });

    // 2. Find user + stored token
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    // 3. Compare hashed token
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isValid) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = this.generateTokens(user.id, user.email, user.role);

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return tokens;
  }
}
