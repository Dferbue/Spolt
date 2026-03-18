import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' }); // le decimos que el campo usuario es "email"
  }

  async validate(email: string, contrasena: string) {
    if (!email || !contrasena) throw new BadRequestException();

    const usuario = await this.authService.validateUser(email, contrasena);

    if (!usuario) throw new UnauthorizedException('Credenciales inválidas');

    return usuario;
  }
}
