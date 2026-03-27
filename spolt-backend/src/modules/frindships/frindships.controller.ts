import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FrindshipsService } from './frindships.service';

@UseGuards(AuthGuard('jwt'))
@Controller('frindships')
export class FrindshipsController {
  constructor(private readonly frindshipsService: FrindshipsService) { }

  //Creamos la amistad
  @Post(':id')
  create(@Req() req: any, @Param('id') id_receptor: string) {
    return this.frindshipsService.create({
      id_solicitante: req.user.id_usuario,
      id_receptor: Number(id_receptor),
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


  
}
