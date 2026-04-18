export interface NivelDeportivo {
  id_nivel_deportivo: number;
  id_deporte: number;
  nivel: number;
  experiencia_actual: number;
  experiencia_total: number;
  partidos_jugados: number;
  xp_siguiente_nivel: number;  // Calculado en backend
  deporte: {
    nombre: string;
    imagen_icono: string | null;
  };
}