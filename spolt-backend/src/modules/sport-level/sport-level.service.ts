import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SportLevelService {
    constructor(private prisma: PrismaService) { }

    //Metodo que dice cuanta experiencia es segun el evento que sea
    xpEvento(tipoEvento: string) {
        switch (tipoEvento) {
            case "partido":
                return 50;
            case "torneo":
                return 150;
            case "playday":
                return 150;
            default:
                return 0; // Añadimos un caso por defecto para asegurar que siempre devuelva un número
        }
    }

    //Creamos al funcion que servira para crear la experiencia
    async darExeperiencia(id_usuario: number, id_deporte: number, tipoEvento: string) {
        //Obtenemos la experiencia segun el tipo de evento que sea
        const xp = this.xpEvento(tipoEvento);

        // Buscar o crear el registro
        let registro = await this.prisma.nivelDeportivo.upsert({
            where: { id_usuario_id_deporte: { id_usuario, id_deporte } },
            create: { id_usuario, id_deporte, nivel: 1, experiencia_actual: 0, experiencia_total: 0, partidos_jugados: 0 },
            update: {}
        });

        // Sumar XP
        let xpActual = registro.experiencia_actual + xp;
        let xpTotal = registro.experiencia_total + xp;
        let nivel = registro.nivel;
        let partidos = registro.partidos_jugados + 1;

        // Subir de nivel en bucle
        while (nivel < 100) {
            const xpNecesaria = 51 + nivel;
            if (xpActual >= xpNecesaria) {
                xpActual -= xpNecesaria;
                nivel += 1;
            } else {
                break;
            }
        }

        // Si llegó al nivel 100, cap XP actual a 0
        if (nivel >= 100) {
            nivel = 100;
            xpActual = 0;
        }

        // Guardar en BD
        await this.prisma.nivelDeportivo.update({
            where: { id_nivel_deportivo: registro.id_nivel_deportivo },
            data: { nivel, experiencia_actual: xpActual, experiencia_total: xpTotal, partidos_jugados: partidos }
        });
    }

    //Creamos una funcion que os traiga todas la relaciones con deportes que tenga el usuairo con los deportes , obteniendo el nivel de todos los deportes
    async getNivelesDeDeportesDelUsuario(id_usuario: number) {
        try {
            const niveles = await this.prisma.nivelDeportivo.findMany({
                where: {
                    id_usuario: id_usuario
                },
                include: {
                    deporte: {
                        select: {
                            nombre: true,
                            imagen_icono: true
                        }
                    }
                }
            });

            // Mapeamos para inyectar la xp_siguiente_nivel
            return niveles.map(n => ({
                ...n,
                xp_siguiente_nivel: this.calcularXpParaSiguienteNivel(n.nivel)
            }));
        } catch (error) {
            console.error("Error obteniendo niveles deportivos (posiblemente la tabla no exista):", error);
            // Retornamos un array vacío para no bloquear el servidor ni el frontend
            return [];
        }
    }

    //Creamos la funcion para traernos los datos solo de un deporte
    async getNiveleDelDeporteDelUsuario(id_usuario: number, id_deporte: number) {
        const registro = await this.prisma.nivelDeportivo.findFirst({
            where: {
                id_usuario: id_usuario,
                id_deporte: id_deporte
            },
            select: {
                nivel: true // Seleccionamos únicamente el campo 'nivel'
            }
        });

        // Devolvemos directamente el valor numérico del nivel, o null si no se encuentra
        return registro ? registro.nivel : null;
    }

    //Calcula la experiencia necesaria para subir al siguiente nivel
    calcularXpParaSiguienteNivel(nivel: number): number {
        return 51 + nivel;
    }
}
