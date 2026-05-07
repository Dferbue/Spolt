import { Injectable } from '@nestjs/common';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AppCacheService } from 'src/cache/app-cache.service';

@Injectable()
export class SportsService {
  constructor(
    private prisma: PrismaService,
    private cache: AppCacheService,
  ) {}

  async create(createSportDto: CreateSportDto) {
    const sport = await this.prisma.deporte.create({ data: createSportDto });
    await Promise.all([
      this.cache.bumpVersion('sports'),
      this.cache.bumpVersion('admin'),
    ]);

    return sport;
  }

  async findAll() {
    const version = await this.cache.getVersion('sports');
    const key = this.cache.key('sports', version, 'all');

    return this.cache.getOrSet(key, 3600000, () =>
      this.prisma.deporte.findMany(),
    );
  }

  async update(id: number, updateSportDto: UpdateSportDto) {
    const sport = await this.prisma.deporte.update({
      where: { id_deporte: id },
      data: updateSportDto,
    });

    await Promise.all([
      this.cache.bumpVersion('sports'),
      this.cache.bumpVersion('events'),
    ]);

    return sport;
  }

  async remove(id: number) {
    const sport = await this.prisma.deporte.delete({
      where: { id_deporte: id },
    });

    await Promise.all([
      this.cache.bumpVersion('sports'),
      this.cache.bumpVersion('events'),
      this.cache.bumpVersion('admin'),
    ]);

    return sport;
  }
}
