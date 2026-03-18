import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from '../users/dto/users.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(reviewerId: number, dto: CreateReviewDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new BadRequestException('Pedido no encontrado');
    if (order.status !== 'COMPLETADA')
      throw new BadRequestException('Solo puedes reseñar pedidos completados');

    // Ensure reviewer is part of this order
    if (order.clienteId !== reviewerId && order.repartidorId !== reviewerId)
      throw new ForbiddenException('No participas en este pedido');

    // Ensure the sujeto is the other party
    if (
      (reviewerId === order.clienteId && dto.sujetoId !== order.repartidorId) ||
      (reviewerId === order.repartidorId && dto.sujetoId !== order.clienteId)
    ) {
      throw new BadRequestException('Solo puedes reseñar a la otra parte del pedido');
    }

    return this.prisma.review.create({
      data: {
        puntos: dto.puntos,
        comentario: dto.comentario,
        orderId: dto.orderId,
        sujetoId: dto.sujetoId,
      },
    });
  }

  async getForUser(userId: number) {
    return this.prisma.review.findMany({
      where: { sujetoId: userId },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Admin – get all reviews */
  async getAll() {
    return this.prisma.review.findMany({
      include: {
        sujeto: { select: { id: true, nombre: true } },
        order: { select: { id: true, descripcion: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(reviewId: number) {
    return this.prisma.review.delete({ where: { id: reviewId } });
  }
}
