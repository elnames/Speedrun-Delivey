import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EvidenceService {
  constructor(private prisma: PrismaService) {}

  async create(orderId: number, imageUrl: string, notas?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Pedido no encontrado');

    return this.prisma.evidence.create({
      data: {
        orderId,
        imageUrl,
        notas,
      },
    });
  }

  async findByOrder(orderId: number) {
    return this.prisma.evidence.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
