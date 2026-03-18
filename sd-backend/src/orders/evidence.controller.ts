import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('orders/:orderId/evidence')
export class EvidenceController {
  constructor(private evidenceService: EvidenceService) {}

  @Post()
  create(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body('imageUrl') imageUrl: string,
    @Body('notas') notas: string,
  ) {
    return this.evidenceService.create(orderId, imageUrl, notas);
  }

  @Get()
  findAll(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.evidenceService.findByOrder(orderId);
  }
}
