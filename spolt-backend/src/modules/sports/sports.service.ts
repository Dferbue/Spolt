import { Injectable } from '@nestjs/common';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SportsService {

  constructor(private prisma:PrismaService){}

  create(createSportDto: CreateSportDto) {
    return this.prisma.deporte.create({ data: createSportDto });
  }

  findAll() {
    return this.prisma.deporte.findMany();
  }

  update(id: number, updateSportDto: UpdateSportDto) {
    return this.prisma.deporte.update({
      where: { id_deporte :id},
      data: updateSportDto,
    });
  }

  remove(id: number) {
    return this.prisma.deporte.delete({
      where: { id_deporte:id },
    });
  }
}
