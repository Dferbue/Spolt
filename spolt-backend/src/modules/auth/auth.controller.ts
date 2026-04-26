import type { Response } from 'express';

import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestEmailChangeDto } from './dto/request-email-change.dto';
import { UsersService } from '../users/users.service';


@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(loginDto);
    this.setCookies(res, tokens);
    return {
      message: 'Logged in successfully',
      ...tokens
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.id_usuario);
    res.clearCookie('Authentication');
    res.clearCookie('Refresh');
    return { message: 'Logged out successfully' };
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user['userId'];
    const refreshToken = req.user['refreshToken'];
    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    this.setCookies(res, tokens);
    return {
      message: 'Tokens refreshed',
      ...tokens
    };
  }

  private setCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    res.cookie('Authentication', tokens.accessToken, {
      httpOnly: true,
      path: '/',
      maxAge: 3600 * 1000, // 1 hour
    });
    res.cookie('Refresh', tokens.refreshToken, {
      httpOnly: true,
      path: '/',
      maxAge: 14 * 24 * 3600 * 1000, // 14 días
    });
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('request-email-change')
  @HttpCode(HttpStatus.OK)
  async requestEmailChange(@Req() req: any, @Body() dto: RequestEmailChangeDto) {
    return await this.authService.requestEmailChange(req.user.id_usuario, dto.newEmail);
  }

  @Post('confirm-email-change')
  @HttpCode(HttpStatus.OK)
  async confirmEmailChange(@Body('token') token: string) {
    return await this.authService.confirmEmailChange(token);
  }

  @Post('confirm-register')
  @HttpCode(HttpStatus.OK)
  async confirmRegister(@Body('token') token: string) {
    return await this.authService.confirmRegistration(token);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getUserProfile(@Req() req: any) {
    const user = await this.usersService.findById(req.user.id_usuario);
    if (!user) return null;
    
    // Eliminamos campos sensibles antes de enviar al frontend
    const { 
      contrasena_hash, 
      refresh_token_hash, 
      reset_token, 
      reset_token_expires, 
      new_email, 
      ...safeUser 
    } = user as any;
    
    return safeUser;
  }
}
