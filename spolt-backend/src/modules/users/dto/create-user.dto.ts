import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsDateString, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsBoolean()
  aceptado_terminos: boolean;

  @IsNotEmpty()
  @IsString()
  nombre_usuario: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  nombre_completo?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;

  @IsOptional()
  @IsString()
  biografia?: string;

  @IsOptional()
  @IsString()
  imagen_perfil?: string;
}
