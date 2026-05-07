export enum TipoEvento {
  partido = 'partido',
  torneo = 'torneo',
  playday = 'playday',
}

export interface CreateEvent {
  id_deporte: number;
  titulo: string;
  descripcion?: string;
  tipo_evento: TipoEvento;
  fecha_evento: string; // ISO Date string
  hora_inicio: string;
  hora_fin?: string;
  ubicacion?: string;
  latitud?: number;
  longitud?: number;
  numero_max_participantes: number;
}

export interface EventInterface{
  id?: number;
  id_evento?: number; // Real id de Prisma
  id_creador: number;
  id_deporte: number;
  titulo: string;
  descripcion: string | null;
  tipo_evento: TipoEvento;
  estado?: string;
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string | null;
  ubicacion: string | null;
  latitud: number | null;
  longitud: number | null;
  numero_max_participantes: number;
  numero_participantes_actuales?: number;
  participantes_actuales?: number;
  creador?: {
    id_usuario: number;
    nombre_usuario: string;
    imagen_perfil: string | null;
  };
  deporte?: {
    id_deporte: number;
    nombre: string;
    imagen_icono: string | null;
    descripcion: string | null;
  };
  nombre_creador?: string;
  nombre_deporte?: string;
  distancia?: number;
  fecha_creacion?: string;
  participantes?: {
    usuario: {
      id_usuario: number;
      nombre_usuario: string;
      imagen_perfil: string | null;
    }
  }[];
}

export interface eventAction{
    evento:EventInterface,
    action:string
}

