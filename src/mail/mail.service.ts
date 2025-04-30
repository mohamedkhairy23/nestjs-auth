/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendOtpEmail(to: string, otp: string) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Your App" <${this.configService.get<string>('MAIL_USER')}>`,
      to,
      subject: 'Password Reset OTP',
      text: `Your OTP code is: ${otp}. It expires in 10 minutes.`,
      html: `<p>Your OTP code is: <b>${otp}</b>. It expires in 10 minutes.</p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendVerificationEmail(to: string, token: string) {
    const verifyLink = `http://localhost:3000/users/verify-email?token=${token}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Your App" <${this.configService.get<string>('MAIL_USER')}>`,
      to,
      subject: 'Verify Your Email',
      html: `
      <p>Thank you for registering!</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyLink}">${verifyLink}</a>
      <p>This link will expire soon.</p>
    `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
