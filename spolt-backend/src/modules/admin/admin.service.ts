import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [userCount, activeEventsCount, sportsCount] = await Promise.all([
      this.prisma.usuario.count(),
      this.prisma.eventoDeportivo.count({
        where: { estado: 'abierto' },
      }),
      this.prisma.deporte.count(),
    ]);

    return {
      userCount,
      activeEventsCount,
      sportsCount,
    };
  }
}
