import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FrindshipsService } from './frindships.service';

@UseGuards(AuthGuard('jwt'))
@Controller('frindships')
export class FrindshipsController {
  constructor(private readonly frindshipsService: FrindshipsService) { }

  //Creamos la amistad por nombre de usuario
  @Post(':username')
  create(@Req() req: any, @Param('username') username: string) {
    return this.frindshipsService.create({
      id_solicitante: req.user.id_usuario,
      username: username,
    });
  }

  // Enviar solicitud de amistad usando el código Spolt del receptor (ej: SPOLT-BX4K7M)
  @Post('code/:code')
  createByCode(@Req() req: any, @Param('code') code: string) {
    return this.frindshipsService.createByCode({
      id_solicitante: req.user.id_usuario,
      codigo: code,
    });
  }

  // Aceptar una solicitud de amistad
  @Patch('accept/:id')
  acceptFriend(@Req() req: any, @Param('id') id_amistad: string) {
    return this.frindshipsService.acceptFriend(
      Number(id_amistad),
      req.user.id_usuario
    );
  }

  //Obtenemos todas las amistades del usuario
  @Get()
  findAllFriends(@Req() req: any) {
    return this.frindshipsService.findAllFriends(req.user.id_usuario);
  }

  //Eliminar una amistad
  @Delete(':id')
  remove(@Req() req: any, @Param('id') id_amistad: string) {
    // Llamamos a la función del servicio pasando el ID de la amistad y el del usuario
    return this.frindshipsService.deleteAmistaad(
      Number(id_amistad),
      req.user.id_usuario
    );
  }


  //Peticiones que me han echo a mi
  @Get("recived")
  peticionesAmistadRecividas(@Req() req: any) {
    return this.frindshipsService.findPeticionesRecibidas(req.user.id_usuario);
  }


  //Peticiones enviadas
  @Get("send")
  peticionesAmistadEnviadas(@Req() req: any) {
    return this.frindshipsService.findPeticionesEnviadas(req.user.id_usuario);
  }

  //Metodo que usaran los administradores papra ver las amistades de un usuario
  @Get('admin/:id')
  findAllFriendsAdmin(@Req() req: any, @Param('id') id_usuario: string) {
    return this.frindshipsService.findAllFriendsAdmin(req.user.id_usuario, Number(id_usuario));
  }
  
}
