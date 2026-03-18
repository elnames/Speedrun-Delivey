import {
  Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards, Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateOrderDto } from './dto/order.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @Roles('CLIENTE')
  create(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(req.user.id, dto);
  }

  /** Tablón de Ofertas – visible para REPARTIDORES */
  @Get('open')
  @Roles('REPARTIDOR', 'ADMIN')
  findOpen() {
    return this.ordersService.findOpen();
  }

  @Get('mine')
  findMine(@Request() req: any) {
    return this.ordersService.findMine(req.user.id, req.user.role);
  }

  @Get('metrics')
  @Roles('ADMIN')
  getMetrics() {
    return this.ordersService.getMetrics();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Post(':id/offers')
  @Roles('REPARTIDOR')
  createOffer(@Param('id', ParseIntPipe) id: number, @Request() req: any, @Body('montoOfertado') monto: number) {
    return this.ordersService.createOffer(id, req.user.id, monto);
  }

  @Patch(':id/accept-offer/:offerId')
  @Roles('CLIENTE')
  acceptOffer(@Param('id', ParseIntPipe) id: number, @Param('offerId', ParseIntPipe) offerId: number, @Request() req: any) {
    return this.ordersService.acceptOffer(id, offerId, req.user.id);
  }

  @Patch(':id/start')
  @Roles('REPARTIDOR')
  start(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.ordersService.startDelivery(id, req.user.id);
  }

  @Patch(':id/complete')
  @Roles('REPARTIDOR')
  complete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.ordersService.completeDelivery(id, req.user.id);
  }

  @Patch(':id/accept-invitation')
  @Roles('REPARTIDOR')
  acceptInv(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.ordersService.acceptInvitation(id, req.user.id);
  }

  @Patch(':id/reject-invitation')
  @Roles('REPARTIDOR')
  rejectInv(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.ordersService.rejectInvitation(id, req.user.id);
  }

  @Patch(':id/cancel')

  cancel(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.ordersService.cancel(id, req.user.id);
  }
}
