/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
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
        name: name,
        appName: 'Nexus Courier Group',
        verificationLink: `http://localhost:3000/auth/verify?token=${token}`,
        year: new Date().getFullYear(),
      },
    });
  }
}
