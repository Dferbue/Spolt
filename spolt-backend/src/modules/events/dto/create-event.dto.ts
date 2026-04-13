import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsDateString,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

enum TipoEvento {
  partido = 'partido',
  torneo = 'torneo',
}

export class CreateEventDto {
  @IsNotEmpty()
  @IsInt()
  id_deporte: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNotEmpty()
  @IsEnum(TipoEvento)
  tipo_evento: TipoEvento;

  @IsNotEmpty()
  @IsDateString()
  fecha_evento: string;

  @IsNotEmpty()
  @IsString()
  hora_inicio: string;

  @IsOptional()
  @IsString()
  hora_fin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  ubicacion?: string;

  @IsOptional()
  @IsNumber()
  latitud?: number;

  @IsOptional()
  @IsNumber()
  longitud?: number;

  @IsNotEmpty()
  @IsInt()
  @Min(2)
  @Max(50)
  numero_max_participantes: number;
}
