import { Controller, Post, Get, Body, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
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
    @Request() req: any,
  ) {
    return this.evidenceService.create(orderId, imageUrl, notas, req.user.id);
  }

  @Get()
  findAll(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Request() req: any,
  ) {
    return this.evidenceService.findByOrder(orderId, req.user.id);
  }
}
