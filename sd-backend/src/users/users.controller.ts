import {
  Controller, Get, Post, Delete, Patch, Body, Param, ParseIntPipe, UseGuards, Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateTarifaDto } from './dto/users.dto';
import { AdminCreateUserDto, AdminUpdateUserDto, AdminUpdatePasswordDto } from './dto/admin-users.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Get('couriers')
  getCouriers() {
    return this.usersService.getCouriers();
  }


  @Post('me/tarifas')
  @Roles('REPARTIDOR')
  addTarifa(@Request() req: any, @Body() dto: CreateTarifaDto) {
    return this.usersService.createTarifa(req.user.id, dto);
  }

  @Get('me/tarifas')
  getTarifas(@Request() req: any) {
    return this.usersService.getTarifas(req.user.id);
  }

  @Delete('me/tarifas/:id')
  @Roles('REPARTIDOR')
  deleteTarifa(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteTarifa(req.user.id, id);
  }

  @Get()
  @Roles('ADMIN')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Post()
  @Roles('ADMIN')
  adminCreateUser(@Body() dto: AdminCreateUserDto) {
    return this.usersService.adminCreateUser(dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  adminDeleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.adminDeleteUser(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  adminUpdateUser(@Param('id', ParseIntPipe) id: number, @Body() dto: AdminUpdateUserDto) {
    return this.usersService.adminUpdateUser(id, dto);
  }

  @Patch(':id/password')
  @Roles('ADMIN')
  adminUpdatePassword(@Param('id', ParseIntPipe) id: number, @Body() dto: AdminUpdatePasswordDto) {
    return this.usersService.adminUpdatePassword(id, dto.password);
  }
}
