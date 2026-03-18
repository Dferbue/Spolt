import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FrindshipsService } from './frindships.service';
import { CreateFrindshipDto } from './dto/create-frindship.dto';
import { UpdateFrindshipDto } from './dto/update-frindship.dto';

@Controller('frindships')
export class FrindshipsController {
  constructor(private readonly frindshipsService: FrindshipsService) {}

  @Post()
  create(@Body() createFrindshipDto: CreateFrindshipDto) {
    return this.frindshipsService.create(createFrindshipDto);
  }

  @Get()
  findAll() {
    return this.frindshipsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.frindshipsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFrindshipDto: UpdateFrindshipDto) {
    return this.frindshipsService.update(+id, updateFrindshipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.frindshipsService.remove(+id);
  }
}
