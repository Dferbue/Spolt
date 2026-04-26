import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as crypto from "crypto";

@Injectable()
export class EmailService {
  //Metemos la intancia del mailerSercice
  constructor(private mailerService:MailerService){}

  //Creamos el emial de vienvenida
  async emailWelcome(data:any){
    await this.mailerService.sendMail({
      to:data.email,
      subject:"Bien venido a Spolt",
      template:'./welcome', //Esto es la platilla que vamos a usar para madar el email

      //Las varibles que le vas a mandar a la plantilla
      context:{
        name:data.name
      } 
    })
  }

  // Método para generar un token seguro (puedes usarlo aquí o en el AuthService)
  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Correo para restablecer la contraseña
  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `http://localhost:4200/reset-password?token=${token}`;
    
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

  // Correo de confirmación de registro (antes de crear la cuenta definitivamente)
  async sendRegistrationConfirmation(email: string, name: string, token: string) {
    const confirmUrl = `http://localhost:4200/confirm-register?token=${token}`;

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
    const confirmationUrl = `http://localhost:4200/confirm-email?token=${token}`;
    
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

