import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }
}
