import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Usuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService , private emailService:EmailService) {}

  /**
   * Crea un nuevo usuario en la base de datos.
   * Realiza validaciones previas para evitar errores de duplicados (P2002 de Prisma).
   */
  async create(createUserDto: CreateUserDto): Promise<Usuario> {
    const { password, email, nombre_usuario, fecha_nacimiento, ...rest } = createUserDto;

    // Verificamos si ya existe un usuario con ese email (para evitar el error 500)
    const existingEmail = await this.prisma.usuario.findUnique({
      where: { email },
    });
    if (existingEmail) {
      // ConflictException envía un código 409 al frontend automáticamente
      throw new ConflictException(`El email ${email} ya está registrado`);
    }

    // 2. Verificamos si el nombre de usuario ya está pillado
    const existingUsername = await this.prisma.usuario.findUnique({
      where: { nombre_usuario },
    });
    if (existingUsername) {
      throw new ConflictException(`El nombre de usuario ${nombre_usuario} ya está en uso`);
    }

    // Hasheamos la contraseña por seguridad
    const hashedPassword = await bcrypt.hash(password, 10);

    // Preparamos la creación del registro
    const newUser= await this.prisma.usuario.create({
      data: {
        ...rest,
        email,
        nombre_usuario,
        // Convertimos el string de la fecha a un objeto Date real de JS
        fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
        contrasena_hash: hashedPassword,
      },
    });

    //Mandamos el correo de vienvenida justo despues de crear e usuario en la base de datos
    await this.emailService.emailWelcome({
      email:newUser.email,
      name:newUser.nombre_usuario
    });

    //Devolvemos el usuario que hemos creado
    return newUser;
  }

  async findAll() {
    return this.prisma.usuario.findMany();
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async findOne(userid: number) {
  return await this.prisma.usuario.findUnique({ where: { id_usuario: userid } });
}

  async update(id: number, updateUserDto: UpdateUserDto | any) {
    const dataToUpdate: any = { ...updateUserDto };
    
    if (dataToUpdate.password) {
      dataToUpdate.contrasena_hash = await bcrypt.hash(dataToUpdate.password, 10);
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
    return this.prisma.usuario.delete({
      where: { id_usuario: id },
    });
  }

  async findById(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id_usuario:id },
    });
  }

  //Esta funcion es para obtener solo los datos que queremos mostrar en el perfil de un usuario 
  async findPerfil(id:number){
    return this.prisma.usuario.findUnique({
      where:{
        id_usuario:id
      },
      select:{
        activo:true,
        biografia:true,
        email:true,
        fecha_nacimiento:true,
        imagen_perfil:true,
        nombre_completo:true,
        nombre_usuario:true
      }
    })
  }

}
