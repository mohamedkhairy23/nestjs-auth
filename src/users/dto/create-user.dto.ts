import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  emailToken?: string | null;

  @IsOptional()
  isVerified?: boolean;

  @IsOptional()
  emailTokenExpires?: Date;
}
