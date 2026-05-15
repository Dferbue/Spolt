import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SportLevelService } from '../sport-level/sport-level.service';
import { Cron } from '@nestjs/schedule';
import { AppCacheService } from 'src/cache/app-cache.service';

@Injectable()
export class EventsService implements OnModuleInit {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private prisma: PrismaService,
    private sportLevel: SportLevelService,
    private cache: AppCacheService,
    private configService: ConfigService,
  ) {}

  // Conteo ligero para el dashboard admin
  async countActive(): Promise<number> {
    return this.prisma.eventoDeportivo.count({ where: { estado: 'abierto' } });
  }

  async create(createEventDto: CreateEventDto, id_creador: number) {
    const { fecha_evento, hora_inicio, hora_fin, ...rest } = createEventDto;

    const fecha = new Date(fecha_evento);
    const unAnioFuturo = new Date();
    unAnioFuturo.setFullYear(unAnioFuturo.getFullYear() + 1);

    if (fecha > unAnioFuturo) {
      throw new BadRequestException(
        'El evento no puede programarse a más de un año vista',
      );
    }

    const event = await this.prisma.eventoDeportivo.create({
      data: {
        ...rest,
        // Convertir a Date objects para satisfacer a Prisma
        fecha_evento: new Date(fecha_evento),
        hora_inicio: new Date(`1970-01-01T${hora_inicio}`),
        hora_fin: hora_fin ? new Date(`1970-01-01T${hora_fin}`) : null,
        id_creador,
      },
    });

    await this.invalidateEventCaches();

    return event;
  }

  async findAll(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      estado?: string;
      id_deporte?: number;
      mes?: string;
      anio?: string;
      fecha_desde?: string;
      fecha_hasta?: string;
      sort?: string;
      tipo_evento?: string;
      lat?: number;
      lng?: number;
      radio_km?: number;
      solo_disponibles?: boolean;
    } = {},
  ) {
    const {
      page = 1,
      limit,
      search,
      estado,
      id_deporte,
      mes,
      anio,
      fecha_desde,
      fecha_hasta,
      sort,
      tipo_evento,
      lat,
      lng,
      radio_km,
      solo_disponibles,
    } = params;

    const version = await this.cache.getVersion('events');
    const key = this.cache.key(
      'events',
      version,
      'list',
      this.cache.hash({
        page,
        limit,
        search,
        estado,
        id_deporte,
        mes,
        anio,
        fecha_desde,
        fecha_hasta,
        sort,
        tipo_evento,
        lat,
        lng,
        radio_km,
        solo_disponibles,
      }),
    );
    const ttlMs = this.configService.get<number>('CACHE_TTL_EVENTS_MS', 30000);

    return this.cache.getOrSet(key, ttlMs, async () => {
      const where: any = {};
      const andConditions: any[] = [];

      if (estado) {
        where.estado = estado;
      }

      if (id_deporte) {
        where.id_deporte = id_deporte;
      }

      if (tipo_evento) {
        where.tipo_evento = tipo_evento;
      }

      if (search) {
        where.OR = [
          { titulo: { contains: search } },
          { descripcion: { contains: search } },
          { ubicacion: { contains: search } },
          { deporte: { nombre: { contains: search } } },
        ];
      }

      if (solo_disponibles) {
        andConditions.push(this.buildAvailableEventsWhere());
      }

      if (fecha_desde || fecha_hasta) {
        where.fecha_evento = {};
        if (fecha_desde) {
          where.fecha_evento.gte = new Date(fecha_desde);
        }
        if (fecha_hasta) {
          const end = new Date(fecha_hasta);
          end.setUTCHours(23, 59, 59, 999);
          where.fecha_evento.lte = end;
        }
      } else if (mes || anio) {
        const yearStr = anio || new Date().getFullYear().toString();

        if (mes) {
          const startDate = new Date(`${yearStr}-${mes}-01T00:00:00.000Z`);
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1);

          where.fecha_evento = {
            gte: startDate,
            lt: endDate,
          };
        } else {
          const startDate = new Date(`${yearStr}-01-01T00:00:00.000Z`);
          const endDate = new Date(
            `${parseInt(yearStr) + 1}-01-01T00:00:00.000Z`,
          );

          where.fecha_evento = {
            gte: startDate,
            lt: endDate,
          };
        }
      }

      if (andConditions.length > 0) {
        where.AND = andConditions;
      }

      let orderBy: any = { fecha_evento: 'asc' };

      if (sort) {
        switch (sort) {
          case 'recientes':
            orderBy = { fecha_evento: 'desc' };
            break;
          case 'antiguos':
            orderBy = { fecha_evento: 'asc' };
            break;
          case 'titulo':
            orderBy = { titulo: 'asc' };
            break;
          case 'deporte':
            orderBy = { deporte: { nombre: 'asc' } };
            break;
          case 'estado':
            orderBy = { estado: 'asc' };
            break;
          case 'creacion':
            orderBy = { fecha_creacion: 'desc' };
            break;
        }
      }

      const queryOptions: any = {
        where,
        include: {
          creador: {
            select: {
              id_usuario: true,
              nombre_usuario: true,
              imagen_perfil: true,
            },
          },
          deporte: true,
          participantes: {
            include: {
              usuario: {
                select: {
                  id_usuario: true,
                  nombre_usuario: true,
                  imagen_perfil: true,
                  niveles_deportivos: true,
                },
              },
            },
          },
        },
        orderBy,
      };

      if (limit) {
        const skip = (page - 1) * limit;
        queryOptions.skip = skip;
        queryOptions.take = limit;

        const [total, data] = await Promise.all([
          this.prisma.eventoDeportivo.count({ where }),
          this.prisma.eventoDeportivo.findMany(queryOptions),
        ]);

        const filtrados = this.filtrarPorDistancia(data, lat, lng, radio_km);

        return {
          data: filtrados,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      }

      const data = await this.prisma.eventoDeportivo.findMany(queryOptions);
      return this.filtrarPorDistancia(data, lat, lng, radio_km);
    });
  }

  // Filtra eventos por distancia usando Haversine.
  // Si no se pasan coordenadas, devuelve la lista sin modificar.
  private filtrarPorDistancia(
    eventos: any[],
    lat?: number,
    lng?: number,
    radio_km?: number,
  ): any[] {
    // Calculamos la distancia para todos si tenemos coordenadas, incluso si no hay radio de filtrado
    if (lat != null && lng != null) {
      eventos.forEach((e) => {
        if (e.latitud != null && e.longitud != null) {
          e.distancia = this.haversine(
            lat,
            lng,
            Number(e.latitud),
            Number(e.longitud),
          );
        }
      });
    }

    // Si no hay radio, devolvemos todos con su distancia calculada
    if (radio_km == null) return eventos;

    // Si hay radio, filtramos
    return eventos.filter(
      (e) => e.distancia != null && e.distancia <= radio_km,
    );
  }

  private haversine(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private buildAvailableEventsWhere() {
    const now = new Date();
    const todayUtc = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const currentTimeUtc = new Date(
      Date.UTC(
        1970,
        0,
        1,
        now.getUTCHours(),
        now.getUTCMinutes(),
        now.getUTCSeconds(),
        now.getUTCMilliseconds(),
      ),
    );

    return {
      estado: 'abierto',
      OR: [
        { fecha_evento: { gt: todayUtc } },
        {
          fecha_evento: todayUtc,
          hora_inicio: { gte: currentTimeUtc },
        },
      ],
    };
  }

  //Creamos una funcion que nos traiga los eventos que ha creado ese usuario
  findYoursEvents(idUser: number) {
    return this.prisma.eventoDeportivo.findMany({
      where: {
        id_creador: idUser,
      },
      include: {
        creador: {
          select: {
            id_usuario: true,
            nombre_usuario: true,
            imagen_perfil: true,
          },
        },
        deporte: true,
        participantes: {
          include: {
            usuario: {
              select: {
                id_usuario: true,
                nombre_usuario: true,
                imagen_perfil: true,
                niveles_deportivos: true,
              },
            },
          },
        },
      },
    });
  }

  //Traer todos los evetos publicos (este tendra que tener un filtro por cercania)

  //Traer los eventos de los amigos del usuario
  async findEventsFriends(id_usuario: number) {
    // Obtener las amistades del usuario
    const amistades = await this.prisma.amistad.findMany({
      where: {
        OR: [
          { id_usuario_solicitante: id_usuario },
          { id_usuario_receptor: id_usuario },
        ],
        estado: 'aceptada',
      },
    });

    // Extraer los IDs de los amigos
    const amigosIds = amistades.map((a) =>
      a.id_usuario_solicitante === id_usuario
        ? a.id_usuario_receptor
        : a.id_usuario_solicitante,
    );

    //Si no tiene amigos devolvemos un array vacio
    if (amigosIds.length === 0) return [];

    // Buscar eventos creados por esos amigos
    return await this.prisma.eventoDeportivo.findMany({
      where: {
        id_creador: { in: amigosIds },
        estado: 'abierto',
      },
      include: {
        creador: {
          select: {
            id_usuario: true,
            nombre_usuario: true,
            imagen_perfil: true,
          },
        },
        deporte: true,
        participantes: {
          include: {
            usuario: {
              select: {
                id_usuario: true,
                nombre_usuario: true,
                imagen_perfil: true,
                niveles_deportivos: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha_evento: 'asc',
      },
    });
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    const { fecha_evento, hora_inicio, hora_fin, ...rest } = updateEventDto;

    if (fecha_evento) {
      const fecha = new Date(fecha_evento);
      const unAnioFuturo = new Date();
      unAnioFuturo.setFullYear(unAnioFuturo.getFullYear() + 1);

      if (fecha > unAnioFuturo) {
        throw new BadRequestException(
          'El evento no puede programarse a más de un año vista',
        );
      }
    }

    const dataToUpdate: any = { ...rest };

    if (fecha_evento) dataToUpdate.fecha_evento = new Date(fecha_evento);
    if (hora_inicio)
      dataToUpdate.hora_inicio = new Date(`1970-01-01T${hora_inicio}`);
    if (hora_fin) dataToUpdate.hora_fin = new Date(`1970-01-01T${hora_fin}`);

    const event = await this.prisma.eventoDeportivo.update({
      where: {
        id_evento: id,
      },
      data: dataToUpdate,
    });

    await this.invalidateEventCaches();

    return event;
  }

  //Funcion que elimina el evento
  async remove(idEvento: number) {
    const event = await this.prisma.eventoDeportivo.delete({
      where: {
        id_evento: idEvento,
      },
    });

    await this.invalidateEventCaches();

    return event;
  }

  //Metodo por el cual te metes en un evento
  async unirseEvento(id_usuario: number, id_evento: number) {
    // Buscamos el evento
    const evento = await this.prisma.eventoDeportivo.findUnique({
      where: { id_evento },
    });

    if (!evento) {
      throw new NotFoundException('El evento no existe');
    }

    // Comprobamos que el evento esté abierto
    if (evento.estado !== 'abierto') {
      throw new BadRequestException(
        'El evento no está abierto para nuevos participantes',
      );
    }

    // Comprobamos la gente que hay
    if (
      evento.numero_participantes_actuales >= evento.numero_max_participantes
    ) {
      throw new ConflictException('El evento ya está lleno');
    }

    // Verificamos que el usuario no esté ya apuntado
    const participacionExistente =
      await this.prisma.participanteEvento.findUnique({
        where: {
          id_evento_id_usuario: {
            id_evento,
            id_usuario,
          },
        },
      });

    if (participacionExistente) {
      throw new ConflictException(
        'Ya estás participando o tienes una solicitud pendiente para este evento',
      );
    }

    // Usamos una Transacción para asegurar la consistencia de los datos
    const participation = await this.prisma.$transaction(async (tx) => {
      // Condición de carrera: Volvemos a comprobar el cupo por si alguien más ocupó la plaza en los últimos milisegundos
      const eventoActual = await tx.eventoDeportivo.findUnique({
        where: { id_evento },
      });

      if (!eventoActual) {
        throw new NotFoundException('El evento ya no existe');
      }

      if (
        eventoActual.numero_participantes_actuales >=
        eventoActual.numero_max_participantes
      ) {
        throw new ConflictException('El evento se acaba de llenar');
      }

      // Añadimos al usuario como participante (lo dejamos confirmado directamente)
      const nuevaParticipacion = await tx.participanteEvento.create({
        data: {
          id_evento,
          id_usuario,
          estado: 'confirmado', // Cambia a 'pendiente' si el creador debe aceptar la solicitud
        },
      });

      // Sumamos 1 al contador de participantes del evento
      await tx.eventoDeportivo.update({
        where: { id_evento },
        data: {
          numero_participantes_actuales: {
            increment: 1,
          },
        },
      });

      return nuevaParticipacion;
    });

    await this.cache.bumpVersion('events');

    return participation;
  }

  //Creamos la funcion para abandonar el evento
  async salirEvento(id_usuario: number, id_evento: number) {
    //Encontramos el evento
    const evento = await this.prisma.eventoDeportivo.findUnique({
      where: {
        id_evento: id_evento,
      },
    });

    //Hacemos las comporbaciones
    if (!evento) {
      throw new NotFoundException('Este evento no existe');
    }
    if (evento.estado === 'cerrado') {
      throw new BadRequestException('Este evento ya ha terminado');
    }
    const updatedEvent = await this.prisma.$transaction(async (tx) => {
      // Condición de carrera: Volvemos a comprobar si el registro sigue ahí
      // dentro de la transacción por si hizo doble click súper rápido.
      const participacion = await tx.participanteEvento.findUnique({
        where: {
          id_evento_id_usuario: {
            id_evento: id_evento,
            id_usuario: id_usuario,
          },
        },
      });

      if (!participacion) {
        throw new ConflictException(
          'No estás participando en este evento o ya te habías salido',
        );
      }

      // Eliminamos su participación físicamente de la base de datos
      await tx.participanteEvento.delete({
        where: { id_participacion: participacion.id_participacion },
      });

      // Restamos 1 al número de participantes actuales de forma segura
      const eventoActualizado = await tx.eventoDeportivo.update({
        where: { id_evento: id_evento },
        data: {
          numero_participantes_actuales: {
            decrement: 1,
          },
        },
      });

      // Devolvemos el evento con el aforo actualizado
      return eventoActualizado;
    });

    await this.cache.bumpVersion('events');

    return updatedEvent;
  }

  //Nos traemos los eventos en los que estas dentro
  async eventosParticipante(id_usuario: number) {
    return await this.prisma.eventoDeportivo.findMany({
      where: {
        participantes: {
          some: {
            id_usuario: id_usuario,
          },
        },
      },
      include: {
        creador: {
          select: {
            id_usuario: true,
            nombre_usuario: true,
            imagen_perfil: true,
          },
        },
        deporte: true,
        participantes: {
          include: {
            usuario: {
              select: {
                id_usuario: true,
                nombre_usuario: true,
                imagen_perfil: true,
                niveles_deportivos: true,
              },
            },
          },
        },
      },
      orderBy: {
        fecha_evento: 'asc',
      },
    });
  }

  //Funcion que ceirra el evento y ya reparte la experiencia
  private async finalizarEventoInterno(evento: any) {
    // Cambiar estado a 'finalizado'
    await this.prisma.eventoDeportivo.update({
      where: { id_evento: evento.id_evento },
      data: { estado: 'finalizado' },
    });

    // Solo repartir XP si el evento estaba lleno
    const estaLleno =
      evento.numero_participantes_actuales >= evento.numero_max_participantes;

    if (!estaLleno) {
      this.logger.log(
        `Evento ${evento.id_evento} finalizado SIN XP (no estaba lleno: ${evento.numero_participantes_actuales}/${evento.numero_max_participantes})`,
      );
      return;
    }

    // Obtener participantes confirmados
    const participantes = await this.prisma.participanteEvento.findMany({
      where: { id_evento: evento.id_evento, estado: 'confirmado' },
    });

    // Dar XP a cada participante
    for (const p of participantes) {
      await this.sportLevel.darExeperiencia(
        p.id_usuario,
        evento.id_deporte,
        evento.tipo_evento,
      );
    }

    // Dar XP al creador también (si no está ya como participante)
    const creadorEsParticipante = participantes.some(
      (p) => p.id_usuario === evento.id_creador,
    );
    if (!creadorEsParticipante) {
      await this.sportLevel.darExeperiencia(
        evento.id_creador,
        evento.id_deporte,
        evento.tipo_evento,
      );
    }
  }

  //Evento para que el credor pueda cerrar el evento un vez empezado cuando el quiera
  async finalizarEvento(id_evento: number, id_creador: number) {
    const evento = await this.prisma.eventoDeportivo.findUnique({
      where: { id_evento },
    });

    if (!evento) throw new NotFoundException('El evento no existe');
    if (evento.id_creador !== id_creador)
      throw new BadRequestException(
        'Solo el creador puede finalizar el evento',
      );
    if (evento.estado === 'finalizado')
      throw new BadRequestException('El evento ya fue finalizado');
    if (evento.estado === 'cancelado')
      throw new BadRequestException(
        'No se puede finalizar un evento cancelado',
      );
    if (
      evento.numero_participantes_actuales < evento.numero_max_participantes
    ) {
      throw new BadRequestException(
        'El evento debe estar lleno para poder finalizarlo',
      );
    }

    // Comprobar que la fecha y hora del evento ya han pasado
    const fechaEvento = new Date(evento.fecha_evento);
    const horaInicio = new Date(evento.hora_inicio);
    fechaEvento.setUTCHours(
      horaInicio.getUTCHours(),
      horaInicio.getUTCMinutes(),
      0,
      0,
    );

    if (new Date() < fechaEvento) {
      throw new BadRequestException(
        'No se puede finalizar el evento antes de su fecha y hora de inicio',
      );
    }

    await this.finalizarEventoInterno(evento);
    await this.invalidateEventCaches();

    return { message: 'Evento finalizado y XP repartida correctamente' };
  }

  // Al arrancar el backend, finaliza cualquier evento pasado que se haya perdido por downtime
  async onModuleInit() {
    await this.finalizarEventosPasados('STARTUP');
  }

  // Lógica compartida: finaliza todos los eventos cuya fecha ya haya pasado y sigan abiertos/cerrados
  private async finalizarEventosPasados(origen: string) {
    const ahora = new Date();

    const eventosPendientes = await this.prisma.eventoDeportivo.findMany({
      where: {
        fecha_evento: { lte: ahora },
        estado: { in: ['abierto', 'cerrado'] },
      },
      include: { participantes: true },
    });

    if (eventosPendientes.length === 0) {
      this.logger.log(`[${origen}] No hay eventos pendientes de finalizar.`);
      return;
    }

    for (const evento of eventosPendientes) {
      try {
        await this.finalizarEventoInterno(evento);
        this.logger.log(
          `[${origen}] Evento ${evento.id_evento} finalizado correctamente.`,
        );
      } catch (err) {
        this.logger.error(
          `[${origen}] Error al finalizar evento ${evento.id_evento}: ${err.message}`,
        );
      }
    }

    this.logger.log(
      `[${origen}] Total finalizados: ${eventosPendientes.length} eventos.`,
    );
    await this.invalidateEventCaches();
  }

  // CRON nocturno — garantía diaria aunque ya se hayan procesado al arrancar
  @Cron('59 23 * * *')
  async finalizarEventosDelDia() {
    await this.finalizarEventosPasados('CRON');
  }

  private async invalidateEventCaches() {
    await Promise.all([
      this.cache.bumpVersion('events'),
      this.cache.bumpVersion('admin'),
    ]);
  }
}
