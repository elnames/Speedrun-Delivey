import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTarifaDto } from './dto/users.dto';
import { AdminCreateUserDto, AdminUpdateUserDto } from './dto/admin-users.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nombre: true,
        role: true,
        tarifas: true,
        reviewsR: {
          select: { puntos: true, comentario: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async createTarifa(userId: number, dto: CreateTarifaDto) {
    return this.prisma.tarifa.create({
      data: { zona: dto.zona, precioBase: dto.precioBase, repartidorId: userId },
    });
  }

  async getTarifas(userId: number) {
    return this.prisma.tarifa.findMany({ where: { repartidorId: userId } });
  }

  async deleteTarifa(userId: number, tarifaId: number) {
    return this.prisma.tarifa.deleteMany({
      where: { id: tarifaId, repartidorId: userId },
    });
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, nombre: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminCreateUser(dto: AdminCreateUserDto) {
    const hashed = await bcrypt.hash(dto.password, 12);
    return this.prisma.user.create({
      data: { ...dto, password: hashed },
      select: { id: true, email: true, nombre: true, role: true },
    });
  }

  async adminUpdateUser(id: number, dto: AdminUpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, email: true, nombre: true, role: true },
    });
  }

  async adminUpdatePassword(id: number, password: string) {
    const hashed = await bcrypt.hash(password, 12);
    return this.prisma.user.update({
      where: { id },
      data: { password: hashed },
    });
  }

  async adminDeleteUser(id: number) {
    return this.prisma.user.delete({ where: { id } });
  }
  
  async getCouriers() {
    return this.prisma.user.findMany({
      where: { role: 'REPARTIDOR' },
      select: {
        id: true,
        nombre: true,
        tarifas: true,
        reviewsR: {
          select: { puntos: true }
        }
      }
    });
  }
}

