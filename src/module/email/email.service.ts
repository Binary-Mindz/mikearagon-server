import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailer: MailerService) {}

  async sendMail(to: string, subject: string, html: string) {
    await this.mailer.sendMail({
      to,
      subject,
      html,
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `http://localhost:3000/auth/verify?token=${token}`;

    await this.sendMail(
      email,
      'Verify your email',
      `
        <h3>Email Verification</h3>
        <p>Click below to verify:</p>
        <a href="${url}">${url}</a>
      `,
    );
  }
}
