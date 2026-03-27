import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FrindshipsService {
  constructor(private prisma: PrismaService) { }

  // Funcion para crear la amistad entre 2 usuarios
  async create(payload: { id_solicitante: number; id_receptor: number }) {
    // No permitir añadirse a sí mismo
    if (payload.id_solicitante === payload.id_receptor) {
      throw new Error('No puedes enviarte una solicitud a ti mismo');
    }
    // Comprobar si ya existe una relación previa
    const existingFriendship = await this.prisma.amistad.findFirst({
      where: {
        OR: [
          { id_usuario_solicitante: payload.id_solicitante, id_usuario_receptor: payload.id_receptor },
          { id_usuario_solicitante: payload.id_receptor, id_usuario_receptor: payload.id_solicitante },
        ],
      },
    });
    if (existingFriendship) {
      throw new Error('Ya existe una solicitud o amistad entre estos usuarios');
    }
    // Crear si todo está OK
    return await this.prisma.amistad.create({
      data: {
        id_usuario_solicitante: payload.id_solicitante,
        id_usuario_receptor: payload.id_receptor,
        estado: 'pendiente',
      },
    });
  }

  //Obtenemos las amistades del usuario que ya estna aceptadas
  async findAllFriends(id_usuario: number) {
    return await this.prisma.amistad.findMany({
      where: {
        OR: [
          { id_usuario_solicitante: id_usuario },
          { id_usuario_receptor: id_usuario },
        ],
        estado: 'aceptada', // Solo queremos los que ya son amigos
      },
      include: {
        // Es muy útil incluir los datos del usuario para no recibir solo IDs
        solicitante: {
          select: { id_usuario: true, nombre_usuario: true, imagen_perfil: true }
        },
        receptor: {
          select: { id_usuario: true, nombre_usuario: true, imagen_perfil: true }
        },
      },
    });
  }


  //Eliminar una amistad
  async deleteAmistaad(id_amistad: number, id_usuario: number) {
    const friendship = await this.prisma.amistad.findUnique({
      where: { id_amistad: id_amistad },
    });

    if (!friendship) {
      throw new NotFoundException('La amistad o solicitud no existe');
    }

    if (friendship.id_usuario_solicitante !== id_usuario && friendship.id_usuario_receptor !== id_usuario) {
      throw new ForbiddenException('No tienes permiso para eliminar esta amistad');
    }

    return await this.prisma.amistad.delete({
      where: { id_amistad: id_amistad },
    });
  }

  // Solicitudes que HE RECIBIDO (las que tengo que aceptar o rechazar)
  async findPeticionesRecibidas(id_usuario: number) {
    return await this.prisma.amistad.findMany({
      where: {
        id_usuario_receptor: id_usuario,
        estado: 'pendiente',
      },
      include: {
        solicitante: { // Incluimos quién nos la envía para ver su nombre/foto
          select: { id_usuario: true, nombre_usuario: true, imagen_perfil: true }
        }
      }
    });
  }

  // Solicitudes que HE ENVIADO (las que están esperando respuesta del otro)
  async findPeticionesEnviadas(id_usuario: number) {
    return await this.prisma.amistad.findMany({
      where: {
        id_usuario_solicitante: id_usuario,
        estado: 'pendiente',
      },
      include: {
        receptor: { // Incluimos a quién se la enviamos
          select: { id_usuario: true, nombre_usuario: true, imagen_perfil: true }
        }
      }
    });
  }


  //Funcion para aceptar una invitacion de amistad
  async acceptFriend(id_amistad: number, id_logged_user: number) {
    // Buscamos primero la solicitud para validar que existe y que está pendiente
    const friendship = await this.prisma.amistad.findUnique({
      where: { id_amistad: id_amistad },
    });

    // Comprobaciones
    if (!friendship) {
      throw new NotFoundException('La solicitud de amistad no existe');
    }
    if (friendship.id_usuario_receptor !== id_logged_user) {
      throw new ForbiddenException('No tienes permiso para aceptar esta solicitud');
    }
    if (friendship.estado !== 'pendiente') {
      throw new BadRequestException('Esta solicitud ya no está pendiente');
    }

    // Todo esta bien por loque devolvemos
    return await this.prisma.amistad.update({
      where: { id_amistad: id_amistad },
      data: {
        estado: 'aceptada',
        fecha_respuesta: new Date(),
      },
    });
  }
}
