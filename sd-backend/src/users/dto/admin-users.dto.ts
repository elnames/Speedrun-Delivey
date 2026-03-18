import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class AdminCreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsIn(['CLIENTE', 'REPARTIDOR', 'ADMIN'])
  role: string;
}

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsIn(['CLIENTE', 'REPARTIDOR', 'ADMIN'])
  role?: string;
}

export class AdminUpdatePasswordDto {
  @IsString()
  @MinLength(6)
  password: string;
}
