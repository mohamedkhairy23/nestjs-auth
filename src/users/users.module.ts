import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // ✅ This line registers UserModel
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
