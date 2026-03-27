import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSportDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  imagen_icono?: string;
}
