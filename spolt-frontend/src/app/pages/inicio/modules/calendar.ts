// models/event.model.ts
export interface CalendarEvent {
  id: number;
  name: string;
  time: string;         // formateado: "18:00 - 20:00"
  date: string;         // formateado: "YYYY-MM-DD"
  color: string;        // generado según deporte/tipo
  sport: string;        // ej: "Voley"
  type: 'partido' | 'torneo';
  location?: string;
}