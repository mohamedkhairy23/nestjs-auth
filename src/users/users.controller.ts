import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private mailService: MailService,
  ) {}

  @Post()
  async register(@Body() dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, Number(process.env.SALT));
    const emailToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(
      Date.now() + Number(process.env.VERIFY_EMAIL_TOKEN_EXPIRES),
    );

    if (isNaN(tokenExpires.getTime())) {
      throw new Error('Invalid expiration date');
    }

    const newUser = await this.usersService.create({
      ...dto,
      password: hashed,
      isVerified: false,
      emailToken,
      emailTokenExpires: tokenExpires,
    });

    await this.mailService.sendVerificationEmail(newUser.email, emailToken);

    return { message: 'Registration successful. Please verify your email.' };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const user = await this.usersService.findByEmailToken(token);
    if (!user) throw new BadRequestException('Invalid token');

    if (user.emailTokenExpires && user.emailTokenExpires < new Date()) {
      throw new BadRequestException('Token has expired');
    }

    user.isVerified = true;
    user.emailToken = null;
    user.emailTokenExpires = null;
    await user.save();

    return { message: 'Email verified successfully' };
  }
}
