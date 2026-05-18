import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Usuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from '../email/email.service';
import { AppCacheService } from 'src/cache/app-cache.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private cache: AppCacheService,
  ) {}

  /**
   * Crea un nuevo usuario en la base de datos.
   * Realiza validaciones previas para evitar errores de duplicados (P2002 de Prisma).
   */
  async create(createUserDto: CreateUserDto): Promise<Usuario> {
    const { password, email, nombre_usuario, fecha_nacimiento, aceptado_terminos, ...rest } =
      createUserDto;

    // Verificamos si ya existe un usuario con ese email (para evitar el error 500)
    const existingEmail = await this.prisma.usuario.findFirst({
      where: { 
        email: {
          equals: email,
          mode: 'insensitive'
        }
      },
    });
    if (existingEmail) {
      // ConflictException envía un código 409 al frontend automáticamente
      throw new ConflictException(`El email ${email} ya está registrado`);
    }

    // 2. Verificamos si el nombre de usuario ya está pillado
    const existingUsername = await this.prisma.usuario.findFirst({
      where: { 
        nombre_usuario: {
          equals: nombre_usuario,
          mode: 'insensitive'
        }
      },
    });
    if (existingUsername) {
      throw new ConflictException(
        `El nombre de usuario ${nombre_usuario} ya está en uso`,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar token de confirmación de email
    const emailToken = crypto.randomBytes(32).toString('hex');

    // Preparamos la creación del registro
    const newUser = await this.prisma.usuario.create({
      data: {
        ...rest,
        email,
        nombre_usuario,
        // Convertimos el string de la fecha a un objeto Date real de JS
        fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
        contrasena_hash: hashedPassword,
        email_verificado: false,
        email_token: emailToken,
        aceptado_terminos,
        fecha_aceptacion_terminos: new Date(),
      },
    });

    await this.cache.bumpVersion('admin');

    // Enviamos el correo de CONFIRMACIÓN (el de bienvenida se envía solo después de confirmar)
    try {
      await this.emailService.sendRegistrationConfirmation(
        newUser.email,
        newUser.nombre_usuario,
        emailToken,
      );
    } catch (error) {
      console.error('Error sending registration confirmation email:', error);
      // No lanzamos error aquí para que el usuario se cree, pero el sistema fallará al enviar el email
      // En un sistema real, querríamos manejar esto mejor (ej. reintentos)
    }

    //Devolvemos el usuario que hemos creado
    return newUser;
  }

  async findAll(
    page: number = 1,
    limit: number = 30,
    search?: string,
    role?: string,
    year?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { nombre_usuario: { contains: search } },
        { email: { contains: search } },
        { nombre_completo: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (year) {
      where.fecha_registro = {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lt: new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`),
      };
    }

    const [users, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          fecha_registro: 'desc',
        },
        select: {
          id_usuario: true,
          nombre_usuario: true,
          email: true,
          nombre_completo: true,
          biografia: true,
          imagen_perfil: true,
          fecha_nacimiento: true,
          fecha_registro: true,
          ultimo_acceso: true,
          activo: true,
          role: true,
          niveles_deportivos: {
            include: {
              deporte: true,
            },
          },
        },
      }),
      this.prisma.usuario.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findFirst({
      where: { 
        email: {
          equals: email,
          mode: 'insensitive'
        }
      },
    });
  }

  async findOne(userid: number) {
    return await this.prisma.usuario.findUnique({
      where: { id_usuario: userid },
    });
  }

  async updateAccessTime(id: number) {
    return this.prisma.usuario.update({
      where: { id_usuario: id },
      data: { ultimo_acceso: new Date() },
      select: { id_usuario: true, ultimo_acceso: true },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto | any) {
    const dataToUpdate: any = { ...updateUserDto };

    if (dataToUpdate.password) {
      dataToUpdate.contrasena_hash = await bcrypt.hash(
        dataToUpdate.password,
        10,
      );
      delete dataToUpdate.password;
    }

    if (dataToUpdate.fecha_nacimiento) {
      dataToUpdate.fecha_nacimiento = new Date(dataToUpdate.fecha_nacimiento);
    }

    return this.prisma.usuario.update({
      where: { id_usuario: id },
      data: dataToUpdate,
    });
  }

  async remove(id: number) {
    const user = await this.prisma.$transaction(async (tx) => {
      // 1. Buscamos las participaciones confirmadas del usuario para saber de qué eventos restarle el cupo
      const participaciones = await tx.participanteEvento.findMany({
        where: {
          id_usuario: id,
          estado: 'confirmado',
        },
      });

      // 2. Extraemos los IDs de esos eventos
      const eventIds = participaciones.map((p) => p.id_evento);

      if (eventIds.length > 0) {
        // 3. Decrementamos el contador de participantes en esos eventos de forma atómica
        await tx.eventoDeportivo.updateMany({
          where: {
            id_evento: { in: eventIds },
          },
          data: {
            numero_participantes_actuales: {
              decrement: 1,
            },
          },
        });
      }

      // 4. Eliminamos al usuario. La cascada configurada en Prisma borrará:
      // - Sus amistades enviadas y recibidas
      // - Sus niveles deportivos
      // - Sus eventos creados
      // - Sus registros de participación en otros eventos
      return tx.usuario.delete({
        where: { id_usuario: id },
      });
    });

    await Promise.all([
      this.cache.bumpVersion('admin'),
      this.cache.bumpVersion('events'),
    ]);

    return user;
  }

  async findById(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id_usuario: id },
    });
  }

  //Esta funcion es para obtener solo los datos que queremos mostrar en el perfil de un usuario
  async findPerfil(id: number) {
    return this.prisma.usuario.findUnique({
      where: {
        id_usuario: id,
      },
      select: {
        activo: true,
        biografia: true,
        email: true,
        fecha_nacimiento: true,
        imagen_perfil: true,
        nombre_completo: true,
        nombre_usuario: true,
      },
    });
  }

  async updateDeveloper(id: number, data: UpdateUserDto | any) {
    const dataToUpdate: any = { ...data };

    if (dataToUpdate.password) {
      dataToUpdate.contrasena_hash = await bcrypt.hash(
        dataToUpdate.password,
        10,
      );
      delete dataToUpdate.password;
    }

    if (dataToUpdate.fecha_nacimiento) {
      dataToUpdate.fecha_nacimiento = new Date(dataToUpdate.fecha_nacimiento);
    }

    return this.prisma.usuario.update({
      where: { id_usuario: id },
      data: dataToUpdate,
    });
  }
}
