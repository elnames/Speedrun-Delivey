import {
  Injectable, BadRequestException, ForbiddenException, NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/order.dto';
import { OrdersGateway } from '../gateway/orders.gateway';
import { OrderStatus } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private gateway: OrdersGateway,
  ) {}

  async create(clienteId: number, dto: CreateOrderDto) {
    const { repartidorId, ...rest } = dto;
    return this.prisma.order.create({
      data: {
        ...rest,
        clienteId,
        status: repartidorId ? 'INVITADO' : 'ABIERTA',
        repartidorId: repartidorId || null,
      },
    });
  }

  async acceptInvitation(orderId: number, repartidorId: number) {
    const order = await this.findOne(orderId);
    if (order.repartidorId !== repartidorId) throw new ForbiddenException('No eres el invitado de este pedido');
    if (order.status !== 'INVITADO') throw new BadRequestException('El pedido no está en estado de invitación');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'ASIGNADA' },
    });
    this.gateway.broadcastStatus(orderId, updated);
    return updated;
  }

  async rejectInvitation(orderId: number, repartidorId: number) {
    const order = await this.findOne(orderId);
    if (order.repartidorId !== repartidorId) throw new ForbiddenException('No eres el invitado de este pedido');
    
    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'ABIERTA', repartidorId: null },
    });
    this.gateway.broadcastStatus(orderId, updated);
    return updated;
  }



  /** Tablón de Ofertas – todas las órdenes abiertas */
  async findOpen() {
    return this.prisma.order.findMany({
      where: { status: 'ABIERTA' },
      include: { 
        cliente: { select: { id: true, nombre: true } },
        _count: { select: { offers: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Historial por usuario (como cliente O como repartidor) */
  async findMine(userId: number, role: string) {
    const where =
      role === 'CLIENTE' ? { clienteId: userId } : { repartidorId: userId };
    return this.prisma.order.findMany({
      where,
      include: {
        cliente: { select: { id: true, nombre: true } },
        repartidor: { select: { id: true, nombre: true } },
        reviews: true,
        evidences: true,
        offers: { include: { repartidor: { select: { id: true, nombre: true } } } }
      },
      orderBy: { createdAt: 'desc' },
    });
  }


  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        cliente: { select: { id: true, nombre: true } },
        repartidor: { 
          select: { 
            id: true, 
            nombre: true,
            tarifas: true 
          } 
        },
        reviews: true,
        evidences: true,
        offers: { include: { repartidor: { select: { id: true, nombre: true } } } }
      },
    });

    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }


  /** Repartidor envía una oferta para un pedido abierto */
  async createOffer(orderId: number, repartidorId: number, montoOfertado: number) {
    const order = await this.findOne(orderId);
    if (order.status !== 'ABIERTA' && order.status !== 'INVITADO') 
      throw new BadRequestException('Pedido no disponible para ofertas');
    
    // Si era una invitación directa, al hacer contra-oferta la "abrimos"
    if (order.status === 'INVITADO') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'ABIERTA' }
      });
    }

    return this.prisma.offer.create({
      data: { orderId, repartidorId, montoOfertado }
    });
  }


  /** Cliente acepta una oferta específica */
  async acceptOffer(orderId: number, offerId: number, clienteId: number) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Pedido no encontrado');
      if (order.clienteId !== clienteId) throw new ForbiddenException('No eres el dueño de este pedido');
      if (order.status !== 'ABIERTA') throw new BadRequestException('El pedido ya no está abierto');

      const offer = await tx.offer.findUnique({ where: { id: offerId } });
      if (!offer || offer.orderId !== orderId) throw new NotFoundException('Oferta no válida');

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: 'ASIGNADA',
          repartidorId: offer.repartidorId,
          montoOfertado: offer.montoOfertado,
        },
      });
    });

    this.gateway.broadcastStatus(orderId, updated);
    return updated;
  }

  /** Repartidor inicia el viaje – inicia cronómetro */
  async startDelivery(orderId: number, repartidorId: number) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Pedido no encontrado');
      if (order.repartidorId !== repartidorId)
        throw new ForbiddenException('No eres el repartidor de este pedido');
      if (order.status !== 'ASIGNADA')
        throw new BadRequestException('El pedido debe estar ASIGNADA para iniciar');

      return tx.order.update({
        where: { id: orderId },
        data: { status: 'EN_CAMINO', startTime: new Date() },
      });
    });

    this.gateway.broadcastStatus(orderId, updated);
    return updated;
  }

  /** Repartidor entrega – detiene cronómetro y calcula totalSeconds */
  async completeDelivery(orderId: number, repartidorId: number) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundException('Pedido no encontrado');
      if (order.repartidorId !== repartidorId)
        throw new ForbiddenException('No eres el repartidor de este pedido');
      if (order.status !== 'EN_CAMINO')
        throw new BadRequestException('El pedido debe estar EN_CAMINO para completar');
      if (!order.startTime)
        throw new BadRequestException('startTime no definido');

      const endTime = new Date();
      const totalSeconds = Math.floor(
        (endTime.getTime() - order.startTime.getTime()) / 1000,
      );

      return tx.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETADA', endTime, totalSeconds },
      });
    });

    this.gateway.broadcastStatus(orderId, updated);
    return updated;
  }

  async cancel(orderId: number, userId: number) {
    const order = await this.findOne(orderId);
    if (order.clienteId !== userId && order.repartidorId !== userId)
      throw new ForbiddenException('No tienes permiso para cancelar este pedido');
    if (['COMPLETADA', 'CANCELADA'].includes(order.status))
      throw new BadRequestException('No se puede cancelar este pedido');

    const updated = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELADA' },
    });
    this.gateway.broadcastStatus(orderId, updated);
    return updated;
  }

  /** Admin – métricas globales */
  async getMetrics() {
    const total = await this.prisma.order.count();
    const completed = await this.prisma.order.count({ where: { status: 'COMPLETADA' } });
    const avgSeconds = await this.prisma.order.aggregate({
      _avg: { totalSeconds: true },
      where: { status: 'COMPLETADA', totalSeconds: { not: null } },
    });
    const topCouriers = await this.prisma.order.groupBy({
      by: ['repartidorId'],
      where: { status: 'COMPLETADA' },
      _count: { id: true },
      _avg: { totalSeconds: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });
    return {
      total,
      completed,
      avgSeconds: avgSeconds._avg.totalSeconds,
      topCouriers,
    };
  }
}
