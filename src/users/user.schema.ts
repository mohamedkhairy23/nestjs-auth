import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role: 'user' | 'admin';

  @Prop({ type: String, default: null })
  otp: string | null;

  @Prop({ type: Date, default: null })
  otpExpires: Date | null;

  @Prop({ type: String, default: null })
  emailToken: string | null;

  @Prop({ type: Date, default: null })
  emailTokenExpires: Date | null;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
