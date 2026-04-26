import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query, UnauthorizedException } from '@nestjs/common';
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
    // Si se intenta cambiar el rol, verificar que quien lo hace sea admin
    if (updateUserDto.role && req.user.role !== 'admin') {
      delete updateUserDto.role; // No permitimos cambiar el rol si no es admin
    }

    // Un usuario normal solo puede editarse a sí mismo (a menos que sea admin)
    if (req.user.role !== 'admin' && req.user.id_usuario !== +id) {
      throw new UnauthorizedException('No tienes permiso para actualizar a este usuario');
    }

    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
