import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppCacheService } from 'src/cache/app-cache.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private cache: AppCacheService,
    private configService: ConfigService,
  ) {}

  async getStats() {
    const version = await this.cache.getVersion('admin');
    const key = this.cache.key('admin', version, 'stats');
    const ttlMs = this.configService.get<number>(
      'CACHE_TTL_ADMIN_STATS_MS',
      30000,
    );

    return this.cache.getOrSet(key, ttlMs, async () => {
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
    });
  }
}
