import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export type UserRole = 'CUSTOMER' | 'ADMIN';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn(['PF', 'PJ'])
  profileType: 'PF' | 'PJ';

  @IsString()
  document: string;

  @IsOptional()
  @IsString()
  agronomistCpf?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}
