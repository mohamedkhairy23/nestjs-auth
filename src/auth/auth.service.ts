/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new ForbiddenException(
        'Please verify your email before logging in',
      );
    }

    const { password: _, ...result } = user.toObject(); // remove password
    return result;
  }

  login(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async changeLoggedInPassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new ForbiddenException('Old password is incorrect');
    }

    const hashed = await bcrypt.hash(dto.newPassword, Number(process.env.SALT));
    user.password = hashed;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + Number(process.env.OTP_EXPIRES));
    await user.save();

    await this.mailService.sendOtpEmail(email, otp);

    return { message: 'OTP sent to your email' };
  }

  async verifyOtpAndResetPassword(dto: VerifyOtpDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (
      !user ||
      user.otp !== dto.otp ||
      !user.otpExpires ||
      user.otpExpires < new Date()
    ) {
      throw new ForbiddenException('Invalid or expired OTP');
    }

    user.password = await bcrypt.hash(
      dto.newPassword,
      Number(process.env.SALT),
    );
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return { message: 'Password has been reset' };
  }
}
