/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';
import { join } from 'path';
import { readFile } from 'fs/promises';

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

  private async renderTemplate(
    templateName: string,
    data: Record<string, any>,
  ): Promise<string> {
    const templatePath = join(
      process.cwd(),
      'src',
      'mail',
      'templates',
      templateName,
    );

    const template = await readFile(templatePath, 'utf-8');
    return ejs.render(template, data);
  }

  async sendOtpEmail(to: string, otp: string) {
    const html = await this.renderTemplate('otp-email.ejs', { otp });

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"NestJS AUTH" <${this.configService.get<string>('MAIL_USER')}>`,
      to,
      subject: 'Password Reset OTP',
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendVerificationEmail(to: string, token: string) {
    const verifyLink = `${process.env.CLIENT_URL}/users/verify-email?token=${token}`;
    const html = await this.renderTemplate('verification-email.ejs', {
      verifyLink,
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"NestJS AUTH" <${this.configService.get<string>('MAIL_USER')}>`,
      to,
      subject: 'Verify Your Email',
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
