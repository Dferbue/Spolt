import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  //Crear eventos
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createEventDto: CreateEventDto, @Req() req: any) {
    const userId = req.user.id_usuario || req.user['userId'];
    return this.eventsService.create(createEventDto, Number(userId));
  }

  @Get('count-active')
  countActive() {
    return this.eventsService.countActive();
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('estado') estado?: string,
    @Query('id_deporte') id_deporte?: string,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
    @Query('sort') sort?: string,
    @Query('tipo_evento') tipo_evento?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radio_km') radio_km?: string,
  ) {
    return this.eventsService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      estado,
      id_deporte: id_deporte ? parseInt(id_deporte, 10) : undefined,
      mes,
      anio,
      sort,
      tipo_evento,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      radio_km: radio_km ? parseFloat(radio_km) : undefined,
    });
  }

  //Eventos de amgos
  @UseGuards(AuthGuard('jwt'))
  @Get('friends')
  findFriendsEvents(@Req() req: any) {
    // Utilizamos el ID del usuario. (Compatibilidad con id_usuario o userId según lo tuvieras en el token)
    const userId = req.user.id_usuario || req.user['userId'];
    return this.eventsService.findEventsFriends(Number(userId));
  }


  //Tus propios eventos
  @UseGuards(AuthGuard('jwt'))
  @Get('my-events')
  findYoursEvents(@Req() req: any) {
    const userId = req.user.id_usuario || req.user['userId'];
    return this.eventsService.findYoursEvents(Number(userId));
  }


  //Unirse a eventos
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/join')
  unirseEvento(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id_usuario || req.user['userId'];
    return this.eventsService.unirseEvento(Number(userId), +id);
  }


  //Salir de eventos
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/leave')
  salirEvento(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id_usuario || req.user['userId'];
    return this.eventsService.salirEvento(Number(userId), +id);
  }

  //Actulizar eventos
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  //Eliminar evemto
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }

  //Eventos en los que tu estas dentro
  @UseGuards(AuthGuard('jwt')) 
  @Get("/participante")
  async participanteEvento(@Req() req:any){
    const userId = req.user.id_usuario || req.user['userId'];
    return await this.eventsService.eventosParticipante(Number(userId));
  }

  //Finalizar un evento manualmente
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/finalizar')
  finalizarEvento(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id_usuario || req.user['userId'];
    return this.eventsService.finalizarEvento(+id, Number(userId));
  }
}

