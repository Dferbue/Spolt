import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SportLevelService } from './sport-level.service';

@Controller('sport-level')
export class SportLevelController {
  constructor(private readonly sportLevelService: SportLevelService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMisNiveles(@Req() req: any) {
    const userId = req.user.id_usuario || req.user['userId'];
    return this.sportLevelService.getNivelesDeDeportesDelUsuario(Number(userId));
  }
}
