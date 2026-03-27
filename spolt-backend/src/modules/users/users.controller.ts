import { Controller, Get, Post, Body, Patch, Param, Delete ,Req ,UseGuards} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Req() req:any) {
    return this.usersService.findOne(req.user.id_usuario);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Req() req:any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id_usuario, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
