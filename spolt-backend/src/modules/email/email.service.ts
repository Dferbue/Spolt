import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from "crypto";

@Injectable()
export class EmailService {
  private frontendUrl: string;

  constructor(
    private mailerService: MailerService,
    private configService: ConfigService
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:4200');
  }

  // Método para generar un token seguro
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Correo de bienvenida
  async emailWelcome(data: any) {
    await this.mailerService.sendMail({
      to: data.email,
      subject: "Bienvenido a Spolt",
      template: './welcome',
      context: {
        name: data.name
      } 
    });
  }

  // Correo para restablecer la contraseña
  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Restablecer contraseña - Spolt',
      template: './password-reset',
      context: {
        name,
        resetUrl,
      },
    });
  }

  // Correo de confirmación de registro
  async sendRegistrationConfirmation(email: string, name: string, token: string) {
    const confirmUrl = `${this.frontendUrl}/confirm-register?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirma tu cuenta - Spolt',
      template: './register-confirm',
      context: {
        name,
        confirmUrl,
      },
    });
  }

  // Correo para confirmar cambio de email
  async sendEmailChangeConfirmation(newEmail: string, name: string, token: string) {
    const confirmationUrl = `${this.frontendUrl}/confirm-email?token=${token}`;
    
    await this.mailerService.sendMail({
      to: newEmail,
      subject: 'Confirmar nuevo correo electrónico - Spolt',
      template: './email-change',
      context: {
        name,
        newEmail,
        confirmationUrl,
      },
    });
  }
}
