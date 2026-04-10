import { ForbiddenException, Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private prisma: PrismaService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.contrasena_hash))) {
      const { contrasena_hash, refresh_token_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const tokens = await this.getTokens(user.id_usuario, user.email, user.role);
    await this.updateRefreshToken(user.id_usuario, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: number) {
    return this.usersService.update(userId, { refresh_token_hash: null });
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refresh_token_hash)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refresh_token_hash,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id_usuario, user.email, user.role);
    await this.updateRefreshToken(user.id_usuario, tokens.refreshToken);
    return tokens;
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, {
      refresh_token_hash: hash,
    });
  }

  async getTokens(userId: number, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: (this.configService.get<string>('JWT_EXPIRATION') || '3600s') as any,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d') as any,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  //  Lógica de recuperación de contraseña 

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Por seguridad, a veces es mejor no revelar si el email existe
      // Pero en apps privadas es común lanzar error
      throw new NotFoundException('No existe un usuario con ese correo electrónico');
    }

    // Generar token y expiración (1 hora)
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // Guardar en base de datos
    await this.prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: {
        reset_token: token,
        reset_token_expires: expires,
      },
    });

    // Enviar email
    await this.emailService.sendPasswordResetEmail(user.email, user.nombre_usuario, token);

    return { message: 'Se ha enviado un correo de recuperación' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.usuario.findFirst({
      where: {
        reset_token: token,
        reset_token_expires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('El token es inválido o ha expirado');
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar usuario y limpiar token
    await this.prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: {
        contrasena_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      },
    });

    return { message: 'Contraseña actualizada con éxito' };
  }

  // --- Lógica de cambio de email ---

  async requestEmailChange(userId: number, newEmail: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Verificar si el nuevo email ya está en uso
    const existingUser = await this.usersService.findByEmail(newEmail);
    if (existingUser) {
      throw new BadRequestException('El nuevo correo electrónico ya está registrado');
    }

    // Generar token y expiración
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // Guardar en base de datos
    await this.prisma.usuario.update({
      where: { id_usuario: userId },
      data: {
        reset_token: token, // Reutilizamos el campo de token por simplicidad
        reset_token_expires: expires,
        new_email: newEmail,
      },
    });

    // Enviar email de confirmación
    await this.emailService.sendEmailChangeConfirmation(newEmail, user.nombre_usuario, token);

    return { message: 'Se ha enviado un correo de confirmación a tu nueva dirección' };
  }

  async confirmEmailChange(token: string) {
    const user = await this.prisma.usuario.findFirst({
      where: {
        reset_token: token,
        reset_token_expires: {
          gt: new Date(),
        },
        new_email: {
          not: null,
        },
      },
    });

    if (!user) {
      throw new BadRequestException('El token es inválido o ha expirado');
    }

    // Actualizar email y limpiar campos
    await this.prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: {
        email: user.new_email!,
        new_email: null,
        reset_token: null,
        reset_token_expires: null,
      },
    });

    return { message: 'Correo electrónico actualizado con éxito' };
  }
}


