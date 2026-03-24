import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB base64 ≈ 3.75MB real

@Injectable()
export class EvidenceService {
  constructor(private prisma: PrismaService) {}

  async create(orderId: number, imageUrl: string, notas: string | undefined, userId: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido no encontrado');

    if (order.repartidorId !== userId && order.clienteId !== userId)
      throw new ForbiddenException('No tienes permiso para agregar evidencia a este pedido');

    if (!imageUrl || !imageUrl.startsWith('data:image/'))
      throw new BadRequestException('Imagen inválida');

    if (Buffer.byteLength(imageUrl, 'utf8') > MAX_IMAGE_SIZE_BYTES)
      throw new BadRequestException('La imagen excede el límite de 5MB');

    return this.prisma.evidence.create({
      data: { orderId, imageUrl, notas },
    });
  }

  async findByOrder(orderId: number, userId: number) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido no encontrado');

    if (order.repartidorId !== userId && order.clienteId !== userId)
      throw new ForbiddenException('No tienes permiso para ver este pedido');

    return this.prisma.evidence.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
