import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import * as bcrypt from 'bcryptjs';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async register(@Body() dto: CreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, Number(process.env.SALT));
    return this.usersService.create({ ...dto, password: hashed });
  }
}
