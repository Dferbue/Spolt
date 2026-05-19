import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query, UnauthorizedException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { switchAll } from 'rxjs';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '30',
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('year') year?: string
  ) {
    return this.usersService.findAll(+page, +limit, search, role, year);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get("perfil")
  findPerfil(@Req() req:any) {
    return this.usersService.findPerfil(req.user.id_usuario);
  }

  // Endpoint PÚBLICO para obtener los datos de un usuario por su código Spolt
  // Lo necesita la página de invitación (/u/:code) sin que el visitante tenga que estar logueado
  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    const user = await this.usersService.findByCode(code);
    if (!user) throw new NotFoundException('No se encontró ningún usuario con ese código');
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch("ping")
  updateAccessTime(@Req() req:any) {
    return this.usersService.updateAccessTime(req.user.id_usuario);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(":id")
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(+id);
    if (!user) return null;

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

  @UseGuards(AuthGuard('jwt'))
  @Patch('update')
  updatePerfil(@Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id_usuario, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(@Param('id') id: string, @Req() req: any, @Body() updateUserDto: UpdateUserDto) {
    if (updateUserDto.role) {
      if (req.user.role !== 'ceo') {
        delete updateUserDto.role;
      }
      if (req.user.id_usuario === +id && updateUserDto.role !== 'ceo') {
        throw new ForbiddenException('El CEO no puede degradar su propio rol');
      }
    }

    const isPrivileged = req.user.role === 'admin' || req.user.role === 'ceo';
    if (!isPrivileged && req.user.id_usuario !== +id) {
      throw new UnauthorizedException('No tienes permiso para actualizar a este usuario');
    }

    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const targetUser = await this.usersService.findOne(+id);
    if (targetUser?.role === 'ceo') {
      throw new ForbiddenException('No se puede eliminar al CEO');
    }
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'ceo';
    if (!isPrivileged && req.user.id_usuario !== +id) {
      throw new UnauthorizedException('No tienes permiso para eliminar a este usuario');
    }
    return this.usersService.remove(+id);
  }
  /*
  @Patch(":id")
  updateDeveloper(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateDeveloper(+id, updateUserDto);
  }*/
}
