import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { Role } from '@prisma/client'

export class RegisterDto {
  @IsEmail()
  email: string

  @IsString()
  fullName: string

  @IsString()
  @MinLength(6)
  password: string

  @IsString()
  @MinLength(6)
  confirmPassword: string

  @IsEnum(Role)
  role: Role

  @IsString()
  @IsOptional()
  phone?: string
}