import { Injectable, NotFoundException, ForbiddenException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Not } from '@sinclair/typebox';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FrindshipsService {
  constructor(private prisma: PrismaService) { }

  // Funcion para crear la amistad entre 2 usuarios
  async create(payload: { id_solicitante: number; username: string }) {
    // Buscar al usuario receptor por su nombre de usuario
    const receptor = await this.prisma.usuario.findUnique({
      where: {
        nombre_usuario: payload.username,
      },
    });

    if (!receptor) {
      throw new NotFoundException('El usuario no existe');
    }

    const id_receptor = receptor.id_usuario;

    // No permitir añadirse a sí mismo
    if (payload.id_solicitante === id_receptor) {
      throw new BadRequestException('No puedes enviarte una solicitud a ti mismo');
    }

    // Comprobar si ya existe una relación previa
    const existingFriendship = await this.prisma.amistad.findFirst({
      where: {
        OR: [
          { id_usuario_solicitante: payload.id_solicitante, id_usuario_receptor: id_receptor },
          { id_usuario_solicitante: id_receptor, id_usuario_receptor: payload.id_solicitante },
        ],
      },
    });
    if (existingFriendship) {
      throw new BadRequestException('Ya existe una solicitud o amistad entre estos usuarios');
    }

    // Crear si todo está OK
    return await this.prisma.amistad.create({
      data: {
        id_usuario_solicitante: payload.id_solicitante,
        id_usuario_receptor: id_receptor,
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
          select: { id_usuario: true, nombre_usuario: true, imagen_perfil: true, biografia: true, ultimo_acceso: true, niveles_deportivos: { include: { deporte: true } } }
        },
        receptor: {
          select: { id_usuario: true, nombre_usuario: true, imagen_perfil: true, biografia: true, ultimo_acceso: true, niveles_deportivos: { include: { deporte: true } } }
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
        solicitante: {
          select: { id_usuario: true, nombre_usuario: true, imagen_perfil: true, biografia: true }
        },
        receptor: {
          select: { id_usuario: true, nombre_usuario: true, imagen_perfil: true, biografia: true }
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
        solicitante: {
          select: { id_usuario: true, nombre_usuario: true, imagen_perfil: true, biografia: true }
        },
        receptor: {
          select: { id_usuario: true, nombre_usuario: true, imagen_perfil: true, biografia: true }
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

  //Metodo que van a usar los administradores
  async findAllFriendsAdmin(id_admin: number, id_usuario: number) {
    //Comporbamos que el el usuario que esta haciendo la consulta es un administrador
    const admin = await this.prisma.usuario.findUnique({
      where: {
        id_usuario: id_admin
      }
    });

    //Validaciones
    if (!admin) {
      throw new NotFoundException("no se ha encontrado este administrador")
    } else if (admin.role !== "admin" && admin.role !== "ceo") {
      throw new UnauthorizedException('Credenciales inválidas');
    } else {
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
            select: { id_usuario: true, nombre_usuario: true, imagen_perfil: true, ultimo_acceso: true }
          },
          receptor: {
            select: { id_usuario: true, nombre_usuario: true, imagen_perfil: true, ultimo_acceso: true }
          },
        },
      });
    }
  }
}
