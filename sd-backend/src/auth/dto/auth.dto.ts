import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

export enum Role {
  CLIENTE = 'CLIENTE',
  REPARTIDOR = 'REPARTIDOR',
  ADMIN = 'ADMIN'
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  nombre: string;

  @IsEnum(Role)
  role: Role;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
