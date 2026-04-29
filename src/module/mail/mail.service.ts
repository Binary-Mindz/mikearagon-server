import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import { SendMailOptions } from './interface/mail.interface';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('email.user'),
        pass: this.configService.get<string>('email.pass'),
      },
    });
  }

  private compileTemplate(templateName: string, context: any): string {
    const templatePath = path.join(
      process.cwd(),
      'src/module/mail/templates',
      `${templateName}.hbs`,
    );

    const source = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(source);

    return template(context);
  }

  private readonly generalContext = {
    appName: 'Nexus Courier Group',
    year: new Date().getFullYear(),
  };

  async sendMail(options: SendMailOptions): Promise<void> {
    const html = this.compileTemplate(options.template, options.context);

    try {
      await this.transporter.sendMail({
        from: 'Nexus <' + this.configService.get<string>('email.user') + '>',
        to: options.to,
        subject: options.subject,
        html,
      });

      this.logger.log(`Email sent to ${options.to}`);
    } catch (error) {
      this.logger.error(`Email sending failed`, error);
      throw error;
    }
  }

  async sendVerificationEmail(to: string, token: string, name = 'User') {
    return this.sendMail({
      to,
      subject: 'Verify Your Email',
      template: 'email-verification',
      context: {
        ...this.generalContext,
        name: name,
        verificationLink: `http://localhost:3000/auth/verify?token=${token}`,
      },
    });
  }

  async sendForgotPasswordEmail(to: string, code: string, name: string) {
    return this.sendMail({
      to,
      subject: 'Password Reset Code',
      template: 'otp',
      context: {
        ...this.generalContext,
        name,
        otp: code,
        expiry: 5,
      },
    });
  }

  async sendDriverRegistrationEmail(
    to: string,
    name = 'User',
    email: string,
    password: string,
  ) {
    return this.sendMail({
      to,
      subject: 'Your Driver Account is Ready',
      template: 'driver-credential',
      context: {
        ...this.generalContext,
        name: name,
        email: email,
        password,
        loginLink: 'http://localhost:3000/login',
      },
    });
  }
}
