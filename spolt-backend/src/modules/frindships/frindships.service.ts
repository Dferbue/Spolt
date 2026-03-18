import { Injectable } from '@nestjs/common';
import { CreateFrindshipDto } from './dto/create-frindship.dto';
import { UpdateFrindshipDto } from './dto/update-frindship.dto';

@Injectable()
export class FrindshipsService {
  create(createFrindshipDto: CreateFrindshipDto) {
    return 'This action adds a new frindship';
  }

  findAll() {
    return `This action returns all frindships`;
  }

  findOne(id: number) {
    return `This action returns a #${id} frindship`;
  }

  update(id: number, updateFrindshipDto: UpdateFrindshipDto) {
    return `This action updates a #${id} frindship`;
  }

  remove(id: number) {
    return `This action removes a #${id} frindship`;
  }
}
