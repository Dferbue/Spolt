import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

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

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'El color debe ser un HEX válido, ej: #ff006e' })
  color?: string;
}
