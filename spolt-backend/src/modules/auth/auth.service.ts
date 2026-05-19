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

    // Bloquear login si el email no está verificado
    const fullUser = await this.prisma.usuario.findUnique({
      where: { id_usuario: user.id_usuario },
    });
    if (!fullUser?.email_verificado) {
      throw new UnauthorizedException('Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
    }

    const tokens = await this.getTokens(user.id_usuario, user.email, user.role);
    await this.updateRefreshToken(user.id_usuario, tokens.refreshToken);
    // Actualizar último acceso
    await this.prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: { ultimo_acceso: new Date() }
    });
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
    // Actualizar último acceso en cada refresh
    await this.prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: { ultimo_acceso: new Date() }
    });
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
    console.log(`[AuthService] Forgot password request for: ${email}`);
    
    // Buscamos al usuario de forma asíncrona
    this.usersService.findByEmail(email).then(async (user) => {
      if (!user) {
        console.log(`[AuthService] User not found: ${email}`);
        return;
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 1);

      await this.prisma.usuario.update({
        where: { id_usuario: user.id_usuario },
        data: { reset_token: token, reset_token_expires: expires },
      });

      console.log(`[AuthService] Sending reset email to: ${email}`);
      await this.emailService.sendPasswordResetEmail(user.email, user.nombre_usuario, token);
    }).catch(err => {
      console.error('[AuthService] Error in forgotPassword background process:', err);
    });

    return { message: 'Enlace de recuperación enviado. Revisa tu correo.' };
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

  // Confirmación de registro 

  async confirmRegistration(token: string) {
    const user = await this.prisma.usuario.findFirst({
      where: { email_token: token },
    });

    if (!user) {
      throw new BadRequestException('Token de confirmación inválido o ya utilizado');
    }

    if (user.email_verificado) {
      throw new BadRequestException('Esta cuenta ya ha sido verificada');
    }

    // Marcar como verificado y limpiar el token
    await this.prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: {
        email_verificado: true,
        email_token: null,
      },
    });

    // Ahora sí enviamos el correo de bienvenida
    await this.emailService.emailWelcome({
      email: user.email,
      name: user.nombre_usuario,
    });

    return { message: 'Cuenta verificada correctamente. Ya puedes iniciar sesión.' };
  }

  // Reenvío del correo de verificación de registro

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);

    // Respondemos siempre con el mismo mensaje para no revelar si el email existe
    if (!user) {
      return { message: 'Si el correo existe y no está verificado, recibirás un nuevo enlace.' };
    }

    if (user.email_verificado) {
      return { message: 'Esta cuenta ya ha sido verificada. Puedes iniciar sesión.' };
    }

    // Generar nuevo token
    const token = crypto.randomBytes(32).toString('hex');

    await this.prisma.usuario.update({
      where: { id_usuario: user.id_usuario },
      data: { email_token: token },
    });

    await this.emailService.sendRegistrationConfirmation(user.email, user.nombre_usuario, token);

    return { message: 'Si el correo existe y no está verificado, recibirás un nuevo enlace.' };
  }
}


