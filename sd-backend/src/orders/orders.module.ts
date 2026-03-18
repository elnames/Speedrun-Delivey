import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersGateway } from '../gateway/orders.gateway';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';

@Module({
  controllers: [OrdersController, EvidenceController],
  providers: [OrdersService, OrdersGateway, EvidenceService],
})
export class OrdersModule {}
